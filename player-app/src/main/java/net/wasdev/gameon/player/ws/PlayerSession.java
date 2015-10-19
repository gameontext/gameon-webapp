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

import javax.json.Json;
import javax.json.JsonObject;

/**
 *
 */
public class PlayerSession {
	public static final String MEDIATOR_ID = "mediator-id";
	public static final String ROOM_ID = "room-id";
	public static final String LAST_SEEN = "last-seen";

	private final String userName;
	private final String mediatorId;
	private String roomId = "fish"; // FirstRoom.FIRST_ROOM;
	private int suspendCount = 0;

	public PlayerSession(String userName) {
		mediatorId = UUID.randomUUID().toString();
		this.userName = userName;
	}

	/**
	 * @return mediator id (a stringified uuid)
	 */
	public String getMediatorId() {
		return mediatorId;
	}

	/**
	 * @param roomId2
	 * @return
	 */
	public PlayerSession validate(String clientRoomId) {
		// The client room id is the fresher value (fresh retrieval from the DB)
		if ( clientRoomId != null ) {
			if ( clientRoomId.equals(roomId)) {
				return this; // all is well, we have a match
			}
		}
		return null;
	}

	/**
	 * Compose an acknowledgement to send back to the client that
	 * contains the mediator id.
	 *
	 * @return ack message with mediator id
	 */
	public String ack() {
		JsonObject ack = Json.createObjectBuilder().add(MEDIATOR_ID, mediatorId).build();
		return "ack," + ack.toString();
	}


	/**
	 * Catch up a resumed session or re-fetch the history since the last seen
	 * message from the room.
	 *
	 * @param lastmessage Last message id the client saw
	 */
	public void catchUp(long lastmessage) {
		suspendCount = 0; // clear suspended ticks.

		// bail early if no message has ever been read or we are really starting over
		if ( lastmessage == 0 ) {
			return;
		}



	}

	/**
	 * Forward messages from the client on to the active room (provided
	 * the id's match).
	 *
	 * @param routing
	 */
	public void forward(String[] routing) {
		// TODO Auto-generated method stub

	}

	/**
	 *
	 */
	private void destroy() {
		// TODO Auto-generated method stub

	}
}
