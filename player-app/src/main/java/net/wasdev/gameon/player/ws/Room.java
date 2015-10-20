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

import java.util.Collection;
import java.util.Collections;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

/**
 *
 */
public abstract class Room {

	/** Queue of messages destined for the room */
	private final BlockingQueue<String> toRoom = new LinkedBlockingQueue<String>();

	private final String roomId;
	private boolean roomConnected = false;

	public Room(String roomId) {
		this.roomId = roomId;
	}

	/**
	 * @param playerSession
	 */
	public void connect(PlayerSession playerSession) {
		System.out.println("CONNECT: " + playerSession);
	}


	/**
	 * Fetch history from the server (no outstanding queue)
	 * @param lastseen
	 * @return
	 */
	public Collection<? extends String> catchUp(long lastseen) {
		// populate missing history from the room
		return Collections.emptyList();
	}

	/**
	 * Send a single message to the queue for the room.
	 * @param routing Room-bound string
	 */
	public void sendToRoom(String[] routing) {
		System.out.println("SEND TO ROOM: " + routing);
	}

	/**
	 * @param playerSession
	 */
	public void disconnect(PlayerSession playerSession) {
		System.out.println("DISCONNECT: " + playerSession);
	}


	public void destroy() {
		roomConnected = false;
		toRoom.clear();
	}

	@Override
	public String toString() {
		return this.getClass().getName() + "[" + roomId + "]";
	}

}
