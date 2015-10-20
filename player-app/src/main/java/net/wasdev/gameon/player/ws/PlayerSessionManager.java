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
import java.util.concurrent.ConcurrentHashMap;

import javax.annotation.Resource;
import javax.enterprise.concurrent.ManagedScheduledExecutorService;
import javax.enterprise.concurrent.ManagedThreadFactory;
import javax.enterprise.context.ApplicationScoped;
import javax.json.Json;
import javax.json.stream.JsonParser;
import javax.json.stream.JsonParser.Event;
import javax.websocket.Session;

/**
 * @author elh
 *
 */
@ApplicationScoped
public class PlayerSessionManager {
	public static final String MEDIATOR_ID = "mediator-id";
	public static final String ROOM_ID = "room-id";
	public static final String LAST_SEEN = "last-seen";

	private final ConcurrentHashMap<String, PlayerSession> parkedSessions = new ConcurrentHashMap<String, PlayerSession>();

	/** CDI injection of Java EE7 Managed scheduled executor service */
	@Resource
	protected ManagedScheduledExecutorService executor;

	@Resource
	ManagedThreadFactory threadFactory;


	/**
	 * Set the PlayerSession into the websocket session user properties.
	 * @param session target websocket session
	 * @param playerSession player session
	 */
	public void setPlayerSession(Session session, PlayerSession playerSession) {
		session.getUserProperties().put(PlayerSession.class.getName(), playerSession);
	}

	/**
	 * Get the PlayerSession from the websocket session user properties.
	 * @param session source websocket session
	 * @return cached PlayerSession
	 */
	public PlayerSession getPlayerSession(Session session) {
		return (PlayerSession) session.getUserProperties().get(PlayerSession.class.getName());
	}

	/**
	 * Start or resume a "player session". This attempts to smooth things over in the face of a
	 * client that drops frequently but momentarily.
	 *
	 * @param clientSession WebSocket session for the connection between the client and the player
	 * @param routingInfo Routing information: mediator-id, room-id, last-seen
	 * @return a new or resumed PlayerSession
	 */
	public PlayerSession startSession(Session clientSession, String userName, String routingInfo) {
		JsonParser jsonParser = Json.createParser(new StringReader(routingInfo));

		String keyName = null;

		String mediatorId = null;
		String roomId = null;
		long lastmessage = 0;

		if ( routingInfo.length() > 0 ) {
			// Read data provided by the client:
			//   mediator-id: string id for a previous session
			//   room-id: string id for the last known room
			//   last-seen: long id for last message seen from the last known room
			while (jsonParser.hasNext()) {
				Event event = jsonParser.next();
				switch(event) {
					case KEY_NAME:
						keyName = jsonParser.getString();
						break;
					case VALUE_STRING :
						switch(keyName) {
							case MEDIATOR_ID :
								mediatorId = jsonParser.getString();
								break;
							case ROOM_ID :
								roomId = jsonParser.getString();
								break;
							default :
								break;
						}
						break;
					case VALUE_NUMBER :
						switch (keyName) {
							case LAST_SEEN :
								lastmessage = jsonParser.getLong();
								break;
							default :
								break;
						}
					default :
						break;
				}
			}
		}

		PlayerSession playerSession = null;

		// try to resume a parked session
		if ( mediatorId != null ) {
			playerSession = parkedSessions.remove(mediatorId);
			if ( playerSession != null ) {
				playerSession = playerSession.validate(roomId);
			}
		}

		if ( playerSession == null ) {
			// We don't have a session we can resume, make a new one
			playerSession = new PlayerSession(userName, roomId);
			lastmessage = 0;
		}

		// Send the ack back to the client with the (new or confirmed) mediator id
		ConnectionUtils.sendText(clientSession, playerSession.ack());

		// catch up on (and continue to drain) messages headed to the client.
		// when the connection is closed, this thread will clean up on its own
		// as the Runnable exits.
		threadFactory.newThread(playerSession.connect(lastmessage, clientSession)).start();

		return playerSession;
	}

	/**
	 * Move the PlayerSession to the list of suspended sessions.
	 *
	 * @see PlayerEndpoint#onClose(String, Session, javax.websocket.CloseReason)
	 */
	public void suspendSession(PlayerSession session) {
		if ( session != null ) {
			session.disconnect();
			parkedSessions.put(session.getMediatorId(), session);
		}
	}
}
