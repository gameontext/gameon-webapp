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

import javax.websocket.Session;

/**
 *
 */
public interface Room {

	/**
	 * Route to room or to player depending on routing.
	 * @param routing Array of 3 elements: (room|player):(roomId|playerId):content
	 */
	void push(String[] routing);

	/**
	 * @param playerSession
	 * @param lastmessage
	 */
	boolean subscribe(PlayerSession playerSession, long lastmessage);

	/**
	 * @param playerSession
	 */
	void unsubscribe(PlayerSession playerSession);

	/**
	 * @return
	 */
	String getId();

	/**
	 * @param session
	 * @return
	 */
	static Room getRoom(Session session) {
		return (Room) session.getUserProperties().get(Room.class.getName());
	};

	static void setRoom(Session session, Room room) {
		session.getUserProperties().put(Room.class.getName(), session);
	}
}
