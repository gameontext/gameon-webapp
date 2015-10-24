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

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.ThreadFactory;
import java.util.logging.Level;

import javax.websocket.CloseReason;
import javax.websocket.ContainerProvider;
import javax.websocket.DeploymentException;
import javax.websocket.Session;
import javax.websocket.WebSocketContainer;

public class RemoteRoomMediator implements Runnable, RoomMediator {

	private final String roomId;
	private final List<String> targetUrls;
	private final ThreadFactory threadFactory;

	private Session roomSession;
	private Thread roomThread;
	private PlayerConnectionMediator playerSession;
	private volatile boolean keepGoing = true;

	/** Queue of messages destined for the client device */
	private final LinkedBlockingDeque<String> toRoom = new LinkedBlockingDeque<String>();

	/**
	 * @param roomId
	 * @param threadFactory
	 */
	public RemoteRoomMediator(String roomId, List<String> targetUrls, ThreadFactory threadFactory) {
		this.roomId = roomId;
		this.targetUrls = targetUrls;
		this.threadFactory = threadFactory;
	}

	@Override
	public String getId() {
		return roomId;
	}

	/**
	 * Route data to/from the room's websocket session
	 * @param routing
	 */
	@Override
	public void route(String[] routing) {
		switch(routing[0]) {
			case Constants.ROOM :
				toRoom.offer(String.join(",", routing));
				break;
			case Constants.PLAYER :
				playerSession.sendToClient(routing);
		}
		// TODO: Capacity?
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
				String message = toRoom.take();

				if ( !ConnectionUtils.sendText(roomSession, message) ) {
					// If the send failed, tuck the message back in the head of the queue.
					toRoom.offerFirst(message);
					keepGoing = false;
				}
			} catch (InterruptedException ex) {
				if ( keepGoing ) {
					Thread.interrupted();
				}
			}
		}
		Log.log(Level.FINER, this, "Exit room writer thread {0}", this);
	}


	/**
	 * @param playerSession
	 */
	@Override
	public boolean subscribe(PlayerConnectionMediator playerSession, long lastMessage) {
		this.playerSession = playerSession;

		if ( connect() ) {
			// set up delivery thread to send messages to the room
			// as they arrive
			roomThread = threadFactory.newThread(this);
			roomThread.start();
			return true;
		}

		return false;
	}

	/**
	 * @param playerSession
	 */
	@Override
	public void unsubscribe(PlayerConnectionMediator playerSession) {
		this.playerSession = null;

		// Clean up the room session
		// (player leaving the room or client connection destroyed)
		roomThread.interrupt();
		toRoom.clear();
		ConnectionUtils.tryToClose(roomSession);
	}

	/**
	 *
	 */
	private boolean connect() {
		WebSocketContainer c = ContainerProvider.getWebSocketContainer();
		Log.log(Level.FINE, this, "Creating connection to room {0}", roomId);

		for(String urlString : targetUrls ) {
			// try each in turn, return as soon as we successfully connect
			URI uriServerEP = URI.create(urlString);
			try {
				Session s = c.connectToServer(this.getClass(), uriServerEP);

				// YAY! Connected!
				RoomMediator.setRoom(s, this);
				return true;
			} catch (DeploymentException e) {
				Log.log(Level.FINER, this, "Deployment exception creating connection to room " + roomId, e);
			} catch (IOException e) {
				Log.log(Level.FINER, this, "I/O exception creating connection to room " + roomId, e);
			}
		}

		return false;
	}

	/**
	 *
	 */
	@Override
	public void disconnect(CloseReason reason) {
		// This is driven by disconnect: if the connection is disconnected for
		// a not-normal reason, do we reconnect? Respawn the whole room?
		Log.log(Level.FINER, this, "Disconnect {0}: {1}", roomId, reason);
	}

	@Override
	public String toString() {
		return this.getClass().getName() + "[roomId=" + roomId +"]";
	}
}
