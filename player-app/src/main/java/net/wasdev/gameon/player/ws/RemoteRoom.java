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

import javax.websocket.ContainerProvider;
import javax.websocket.DeploymentException;
import javax.websocket.Session;
import javax.websocket.WebSocketContainer;

public class RemoteRoom implements Runnable, Room {

	private final String roomId;
	private final List<String> targetUrls;
	private final ThreadFactory threadFactory;

	private Session roomSession;
	private Thread roomThread;
	private PlayerSession playerSession;
	private volatile boolean keepGoing = true;

	/** Queue of messages destined for the client device */
	private final LinkedBlockingDeque<String> toRoom = new LinkedBlockingDeque<String>();

	/**
	 * @param roomId
	 * @param threadFactory
	 */
	public RemoteRoom(String roomId, List<String> targetUrls, ThreadFactory threadFactory) {
		this.roomId = roomId;
		this.targetUrls = targetUrls;
		this.threadFactory = threadFactory;
	}

	@Override
	public String getId() {
		return roomId;
	}

	/**
	 * Add item to the queue for writing to the room
	 * @param routing
	 */
	@Override
	public void push(String[] routing) {
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
	public boolean subscribe(PlayerSession playerSession, long lastMessage) {
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
	public void unsubscribe(PlayerSession playerSession) {
		this.playerSession = null;

		disconnect();
		roomThread.interrupt();
		toRoom.clear();
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
				Room.setRoom(s, this);
				return true;
			} catch (DeploymentException e) {
				Log.log(Level.FINER, this, "Deployment exception creating connection to room " + roomId, e);
			} catch (IOException e) {
				Log.log(Level.FINER, this, "Deployment exception creating connection to room " + roomId, e);
			}
		}

		return false;
	}

	/**
	 *
	 */
	private void disconnect() {
		// TODO Auto-generated method stub

	}

	@Override
	public String toString() {
		return this.getClass().getName() + "[roomId=" + roomId +"]";
	}
}
