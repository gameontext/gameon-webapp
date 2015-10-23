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
import java.util.logging.Level;

import javax.annotation.Resource;
import javax.enterprise.concurrent.ManagedScheduledExecutorService;
import javax.enterprise.concurrent.ManagedThreadFactory;
import javax.enterprise.context.ApplicationScoped;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.websocket.Session;

/**
 * @author elh
 *
 */
@ApplicationScoped
public class PlayerSessionManager {
	private final ConcurrentHashMap<String, PlayerSession> suspendedSessions = new ConcurrentHashMap<String, PlayerSession>();

	/** CDI injection of Java EE7 Managed scheduled executor service */
	@Resource
	protected ManagedScheduledExecutorService executor;

	/** CDI injection of Java EE7 Managed thread factory */
	@Resource
	protected ManagedThreadFactory threadFactory;

	@Resource
	protected Concierge concierge;

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
	 * Create a new player session to mediate between the client and the room
	 *
	 * @param clientSession WebSocket session for the connection between the client and the player
	 * @param userId User's unique id
	 * @param clientCache Information from the client: updated room, last message seen
	 * @return a new or resumed PlayerSession
	 */
	public PlayerSession startSession(Session clientSession, String userName, String localStorageData) {

		JsonReader jsonReader = Json.createReader(new StringReader(localStorageData));
		JsonObject sessionData = jsonReader.readObject();

		String mediatorId = sessionData.getString(Constants.MEDIATOR_ID, null);
		String roomId = sessionData.getString(Constants.ROOM_ID, null);
		long lastmessage = sessionData.getInt(Constants.BOOKMARK, 0);

		PlayerSession playerSession = null;
		if ( mediatorId != null ) {
			playerSession = suspendedSessions.remove(mediatorId);
		}
		if ( playerSession == null ) {
			playerSession = new PlayerSession(userName, threadFactory, concierge);
		}

		return playerSession;
	}

	/**
	 * Move the PlayerSession to the list of suspended sessions.
	 *
	 * @see PlayerEndpoint#onClose(String, Session, javax.websocket.CloseReason)
	 */
	public void suspendSession(PlayerSession session) {
		Log.log(Level.FINER, this, "Suspending session {0}", session);
		if ( session != null ) {
			suspendedSessions.put(session.getId(), session);
			session.disconnect();
		}
	}
}
