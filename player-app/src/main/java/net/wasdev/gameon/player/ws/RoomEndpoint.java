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

import java.util.logging.Level;

import javax.websocket.ClientEndpoint;
import javax.websocket.CloseReason;
import javax.websocket.EndpointConfig;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;

/**
 *
 */
@ClientEndpoint
public class RoomEndpoint {

	@OnOpen
	public void onOpen(Session session, EndpointConfig ec) {
	}

	@OnClose
	public void onClose(Session session, CloseReason reason) {
	}

	@OnMessage
	public void onMessage(Session session, String message) {
		Room room = Room.getRoom(session);
		Log.log(Level.FINEST, session, "received from room {0}: {1}", room.getId(), message);
		String[] routing = ConnectionUtils.splitRouting(message);
		room.push(routing);
	}

	@OnError
	public void onError(Throwable t, Session session) {
		Room room = Room.getRoom(session);
		Log.log(Level.FINEST, session, "received from room {0}: {1}", room.getId(), t);
		t.printStackTrace();
		ConnectionUtils.tryToClose(session,
				new CloseReason(CloseReason.CloseCodes.UNEXPECTED_CONDITION, t.getClass().getName()));
	}

}
