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
import java.util.Iterator;
import java.util.Map.Entry;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Level;

import javax.annotation.Resource;
import javax.enterprise.concurrent.ManagedScheduledExecutorService;
import javax.enterprise.concurrent.ManagedThreadFactory;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.websocket.Session;

/**
 * @author elh
 *
 */
@ApplicationScoped
public class PlayerSessionManager implements Runnable {
	private final ConcurrentHashMap<String, PlayerConnectionMediator> suspendedSessions = new ConcurrentHashMap<String, PlayerConnectionMediator>();

	/** CDI injection of Java EE7 Managed scheduled executor service */
	@Resource
	protected ManagedScheduledExecutorService executor;

	/** CDI injection of Java EE7 Managed thread factory */
	@Resource
	protected ManagedThreadFactory threadFactory;

	private AtomicReference<ScheduledFuture<?>> reaper = new AtomicReference<ScheduledFuture<?>>(null);

	@Inject
	protected ConciergeClient concierge;

	@Override
	public void run() {
		Log.log(Level.FINEST, this, "start culling sessions: %d", suspendedSessions.size());
		Iterator<Entry<String,PlayerConnectionMediator>> entries = suspendedSessions.entrySet().iterator();
		while (entries.hasNext()) {
			Entry<String,PlayerConnectionMediator> i = entries.next();
			Log.log(Level.FINEST, this, "evaluating session " + i.getValue());
			if ( i.getValue().incrementAndGet() > 5 ) {
				entries.remove();
				i.getValue().destroy();
			}
		}

		updateReaper();

		Log.log(Level.FINEST, this, "End culling sessions");
	}

	private void updateReaper() {
		if ( suspendedSessions.isEmpty() ) {
			// no more suspended sessions, clear the reaper rather than resetting
			reaper.set(null);
		} else {
			// We still have suspended sessions, reschedule for 5 minutes from now.
			reaper.set(executor.schedule(this, 2, TimeUnit.MINUTES));
		}
	}

	/**
	 * Set the PlayerSession into the websocket session user properties.
	 * @param session target websocket session
	 * @param playerSession player session
	 */
	public void setPlayerSession(Session session, PlayerConnectionMediator playerSession) {
		session.getUserProperties().put(PlayerConnectionMediator.class.getName(), playerSession);
	}

	/**
	 * Get the PlayerSession from the websocket session user properties.
	 * @param session source websocket session
	 * @return cached PlayerSession
	 */
	public PlayerConnectionMediator getPlayerSession(Session session) {
		return (PlayerConnectionMediator) session.getUserProperties().get(PlayerConnectionMediator.class.getName());
	}

	/**
	 * Create a new player session to mediate between the client and the room
	 *
	 * @param clientSession WebSocket session for the connection between the client and the player
	 * @param userId User's unique id
	 * @param clientCache Information from the client: updated room, last message seen
	 * @return a new or resumed PlayerSession
	 */
	public PlayerConnectionMediator startSession(Session clientSession, String userName, String localStorageData) {

		JsonReader jsonReader = Json.createReader(new StringReader(localStorageData));
		JsonObject sessionData = jsonReader.readObject();

		String mediatorId = sessionData.getString(Constants.MEDIATOR_ID, null);
		String roomId = sessionData.getString(Constants.ROOM_ID, null);
		String username = sessionData.getString(Constants.USERNAME, null);
		long lastmessage = sessionData.getInt(Constants.BOOKMARK, 0);

		PlayerConnectionMediator playerSession = null;
		if ( mediatorId != null ) {			
			playerSession = suspendedSessions.remove(mediatorId);
			Log.log(Level.FINER, this, "Resuming session session {0} for user {1}", playerSession, userName);
		}
		if ( playerSession == null ) {
			playerSession = new PlayerConnectionMediator(userName, username, threadFactory, concierge);
			Log.log(Level.FINER, this, "Created new session {0} for user {1}", playerSession, userName);
		}

		playerSession.initializeConnection(clientSession, roomId, lastmessage);
		return playerSession;
	}

	/**
	 * Move the PlayerSession to the list of suspended sessions.
	 *
	 * @see PlayerServerEndpoint#onClose(String, Session, javax.websocket.CloseReason)
	 */
	public void suspendSession(PlayerConnectionMediator session) {
		Log.log(Level.FINER, this, "Suspending session {0}", session);
		if ( session != null ) {
			suspendedSessions.put(session.getId(), session);
			session.disconnect();

			if ( reaper.get() == null ) {
				updateReaper();
			}
		}
	}
}
