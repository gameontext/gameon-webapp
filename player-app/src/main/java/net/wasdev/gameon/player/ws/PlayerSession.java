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

import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;

import javax.json.Json;
import javax.json.JsonObject;
import javax.websocket.Session;

/**
 * A session that buffers content destined for the client devices across
 * connect/disconnects.
 */
public class PlayerSession {
	public static final String MEDIATOR_ID = "mediatorId";
	public static final String ROOM_ID = "roomId";
	public static final String LAST_SEEN = "lastSeen";

	private final String username;
	private final String mediatorId;

	private String roomId = FirstRoom.FIRST_ROOM;
	private Room currentRoom = null;
	private int suspendCount = 0;

	/** Queue of messages destined for the client device */
	private final BlockingQueue<String> toClient = new LinkedBlockingQueue<String>();
	private String failedSend = null;

	/**
	 * This will be false whenever the client endpoint has disconnected
	 * (hopefully momentarily). When the client has disconnected, we'll stop
	 * trying to send messages down the pipe, and will just wait a moment
	 * for them to come back.
	 */
	private volatile boolean clientConnected = false;

	/**
	 * Create a new PlayerSession for the user.
	 * @param username Name of user for this session
	 * @param roomId
	 */
	public PlayerSession(String username, String roomId) {
		this.mediatorId = UUID.randomUUID().toString();
		this.username = username;

		// If we have a non-null, not-empty roomId, use that
		// to create the new session.
		if ( roomId != null && !roomId.isEmpty()) {
			this.roomId = roomId;
		}
	}

	/**
	 * Get the mediator id for lookup later
	 * @return mediator id (a stringified uuid)
	 */
	public String getMediatorId() {
		return mediatorId;
	}

	/**
	 *
	 * @param clientRoomId Room id remembered by the client (this value wins,
	 * if it is set).
	 * @return
	 */
	public PlayerSession validate(String clientRoomId) {
		// The client room id is the fresher value (fresh retrieval from the DB)
		if ( roomId.equals(clientRoomId) ) {
			return this; // all is well, we have a match
		}

		// A new PlayerSession will be created for the new room
		return null;
	}

	/**
	 * Compose an acknowledgement to send back to the client that
	 * contains the mediator id.
	 *
	 * @return ack message with mediator id
	 */
	public String ack() {
		JsonObject ack = Json.createObjectBuilder()
				.add(MEDIATOR_ID, mediatorId)
				.add(ROOM_ID, roomId)
				.build();
		return "ack," + ack.toString();
	}


	/**
	 * Catch up a resumed session or re-fetch the history since the last seen
	 * message from the room.
	 *
	 * @param lastmessage Last message id the client saw
	 * @return
	 */
	public Runnable connect(long lastseen, Session clientSession) {
		Log.log(Level.WARNING, this, "client session {0} connected: {1}", username, clientSession);
		clientConnected = true;
		suspendCount = 0; // clear suspended ticks.

		if ( currentRoom == null ) {
			// First room is per-player -- no chat or anything
			currentRoom = new FirstRoom(username);
		}

		// If we had a leftover message that failed to send, try again
		if( failedSend != null ) {
			if ( ConnectionUtils.sendText(clientSession, failedSend) ) {
				failedSend = null;
			} else {
				// the IOException on sendText will also close the connection.
				// return an empty runnable.
				return () -> {};
			}
		}

		// catch up on other missed messages
		toClient.addAll(currentRoom.catchUp(lastseen));

		// connect this session to the room
		currentRoom.connect(this);

		return () -> {
			while ( clientConnected ) {
				try {
					// We're writing one message at a time to drain the queue.
					// This is on its own thread to allow us to continue handling
					// new events while letting the client pull them down as it
					// can. Note this could introduce some lag.. not much we can
					// do in that case.
					String message = toClient.poll(3, TimeUnit.SECONDS);
					if ( message != null ) {
						if ( !ConnectionUtils.sendText(clientSession, message) ) {
							// if the send failed, store the message, and stop looping.
							// the IOException on sendText will also close the connection.
							failedSend = message;
							clientConnected = false;
						}
					}
				} catch (InterruptedException e) {
					//carry on with the next loop: after checking the exit flag
				}
			}
		};
	}

	/**
	 * Turn off the spigot, the client has disconnected.
	 */
	public void disconnect() {
		Log.log(Level.WARNING, this, "client session {0} disconnected", username);
		clientConnected = false;
	}

	/**
	 * Forward messages from the client on to the active room (provided
	 * the id's match).
	 *
	 * @param routing
	 */
	public void route(String[] routing) {
		// We expect room,id,{...}
		if ( routing.length > 2 ) {
			switch(routing[0]) {
				case "room" :
					if ( roomId.equals(routing[1]) ) {
						currentRoom.sendToRoom(routing);
					}
				case "player":
					if ( username.equals(routing[1]) ) {
						toClient.offer(String.join(",", routing));
					}
				default :
					// toss it.
					break;
			}
		}
	}

	/**
	 *
	 */
	private void destroy() {
		Log.log(Level.WARNING, this, "session {0} destroyed", username);
		// session expired.
		toClient.clear();
		currentRoom.disconnect(this);
		currentRoom = null;
	}

	@Override
	public String toString() {
		return this.getClass().getName() + "[id=" + mediatorId + ", username=" + username +"]";
	}
}
