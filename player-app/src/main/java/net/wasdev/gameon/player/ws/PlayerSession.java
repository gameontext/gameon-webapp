/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/
package net.wasdev.gameon.player.ws;

import java.io.StringReader;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.ThreadFactory;
import java.util.logging.Level;

import javax.enterprise.concurrent.ManagedThreadFactory;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.websocket.Session;

/**
 * A session that buffers content destined for the client devices across
 * connect/disconnects.
 */
public class PlayerSession implements Runnable {

	private final String userId;
	private final String id = UUID.randomUUID().toString();
	private final ThreadFactory threadFactory;
	private final Concierge concierge;

	private Session clientSession = null;
	private Thread clientThread = null;
	private volatile boolean keepGoing = true;

	private String roomId = null;
	private Room currentRoom = null;

	/** Queue of messages destined for the client device */
	private final LinkedBlockingDeque<String> toClient = new LinkedBlockingDeque<String>();

	/**
	 * Create a new PlayerSession for the user.
	 * @param userId Name of user for this session
	 * @param threadFactory
	 */
	public PlayerSession(String userId, ManagedThreadFactory threadFactory, Concierge concierge) {
		this.userId = userId;
		this.threadFactory = threadFactory;
		this.concierge = concierge;
	}

	/**
	 * @return ID of this session
	 */
	public String getId() {
		return id;
	}

	/**
	 *
	 * @param clientSession
	 * @param roomId2
	 * @param lastmessage
	 */
	public boolean connectToRoom(Session clientSession, String roomId, long lastmessage) {
		this.clientSession = clientSession;

		currentRoom = concierge.checkin(null, currentRoom, roomId == null ? Constants.FIRST_ROOM : roomId);

		// Get connection to the roo
		if ( currentRoom.subscribe(this, lastmessage) ) {
			this.roomId = currentRoom.getId();

			sendClientAck();

			// set up delivery thread
			clientThread = threadFactory.newThread(this);
			clientThread.start();

			return true;
		}

		// turn on the spigot
		return false;
	}

	/**
	 * Given room,&lt;roomId&gt;,{...}, make sure the specified room id
	 * matches the target room.
	 *
	 * @param routing
	 *
	 */
	public void sendToRoom(String[] routing) {
		if ( Constants.SOS.equals(routing[0])) {
			switchRooms(routing);
		} else if ( currentRoom.getId().equals(routing[1]) ){
			// send messages for the current room on to the room (others fall on the floor)
			currentRoom.route(routing);
		} else {
			Log.log(Level.FINEST, this, "sendToRoom -- Dropping message {0}", Arrays.asList(routing));
		}
	}

	/**
	 * Dedicated thread writing to the client connection
	 */
	@Override
	public void run() {
		// Dedicated thread sending messages back to the client as fast
		// as it can take them: maybe we batch these someday.
		while( keepGoing ) {
			try {
				String message = toClient.take();

				if ( !ConnectionUtils.sendText(clientSession, message) ) {
					// If the send failed, tuck the message back in the head of the queue.
					toClient.offerFirst(message);
				}
			} catch (InterruptedException ex) {
				if ( keepGoing ) {
					Thread.interrupted();
					keepGoing = false;
				} else {
					System.out.println("Interrupted -- stopping now");
				}
			}
		}
		Log.log(Level.FINER, this, "Exit client writer thread {0}", this);
	}

	/**
	 * Compose an acknowledgement to send back to the client that
	 * contains the mediator id.
	 *
	 * @return ack message with mediator id
	 */
	public void sendClientAck() {
		JsonObject ack = Json.createObjectBuilder()
				.add(Constants.MEDIATOR_ID, id)
				.add(Constants.ROOM_ID, roomId)
				.build();

		toClient.add("ack," + ack.toString());
	}

	/**
	 * Add message to queue to return to client
	 * @param routing
	 */
	public void sendToClient(String[] routing) {
		// make sure we're only dealing with messages for everyone,
		// or messages for this user (ignore all others)
		if ( "*".equals(routing[1]) || userId.equals(routing[1])){
			// TODO: Capacity?
			toClient.offer(String.join(",", routing));

			if ( Constants.PLAYER_LOCATION.equals(routing[0])) {
				switchRooms(routing);
			}
		} else {
			Log.log(Level.FINEST, this, "sendToClient -- Dropping message {0}", Arrays.asList(routing));
		}
	}

	private boolean switchRooms(String[] routing) {
		Set<String> visitedRooms = new HashSet<String>();
		visitedRooms.add(currentRoom.getId());

		// Disconnect from the current room
		currentRoom.unsubscribe(this);

		// Transitional place. They might sit here awhile waiting for connection to new room
		toClient.offer(String.format(Constants.NETHER_REGION, userId));

		if ( Constants.SOS.equals(routing[0])) {
			// For an SOS, we don't care about the current room's exits.
			currentRoom = concierge.changeRooms(currentRoom, null);
		} else {
			// If we are properly exiting a room, we have the new room in the payload
			// of the message from the old room.
			JsonReader jsonReader = Json.createReader(new StringReader(routing[2]));
			JsonObject exitData = jsonReader.readObject();
			String exitId = exitData.getString("exitId");

			currentRoom = concierge.changeRooms(currentRoom, exitId);
		}

		// attempt to connect to the new room
		while ( !currentRoom.subscribe(this, 0) ) {
			if ( !visitedRooms.add(currentRoom.getId()) ) {
				return false; // repeat! no connection :(
			}
			currentRoom = concierge.changeRooms(currentRoom, null);
		}

		this.roomId = currentRoom.getId();
		sendClientAck();
		return true;
	}

	/**
	 * This is strictly about pulling from the queue
	 * to send to the client: we're trying to cover short gaps
	 * in connection from the client (within reason)
	 */
	public void disconnect() {
		keepGoing = false;
		if ( clientThread != null)
			clientThread.interrupt();
	}

	/**
	 *
	 */
	public void destroy() {
		Log.log(Level.FINE, this, "session {0} destroyed", userId);
		// session expired.
		toClient.clear();
		currentRoom.unsubscribe(this);
		currentRoom = null;
	}

	@Override
	public String toString() {
		return this.getClass().getName() + "[roomId=" + roomId + ", userId=" + userId +"]";
	}
}
