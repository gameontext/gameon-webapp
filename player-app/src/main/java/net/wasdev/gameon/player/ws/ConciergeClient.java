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

import java.util.List;
import java.util.logging.Level;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.enterprise.concurrent.ManagedThreadFactory;
import javax.enterprise.context.ApplicationScoped;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.ws.rs.ProcessingException;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.ResponseProcessingException;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 */
@ApplicationScoped
public class ConciergeClient {

	/**
	 * CDI injection of Java EE7 Managed thread factory: passed on to Rooms, which are created
	 * here based on the room type.
	 */
	@Resource
	protected ManagedThreadFactory threadFactory;

	private String conciergeLocation;

	Client client;
	WebTarget root;

	@PostConstruct
	public void initClient() {
		try {
			this.conciergeLocation = (String) new InitialContext().lookup("conciergeUrl");
		} catch (NamingException e) {
		}
		this.client = ClientBuilder.newClient();
		this.root = this.client.target(conciergeLocation);

		Log.log(Level.FINER, this, "Concierge initialized with {0}", conciergeLocation);
	}

	public RoomMediator checkin(PlayerConnectionMediator playerSession, RoomMediator currentRoom, String roomId) {
		if ( currentRoom == null && (roomId == null || roomId.isEmpty() || Constants.FIRST_ROOM.equals(roomId)) ) {
			// NEWBIE!!
			return new FirstRoom(true);
		}

		if ( currentRoom != null ) {
			if ( currentRoom.getId().equals(roomId)) {
				// Room session resume
				return currentRoom;
			} else {
				// The player moved rooms somewhere along the way
				// we need to make sure we detach the old session
				currentRoom.unsubscribe(playerSession);
			}
		}

		RoomEndpointList endpointList = getRoomEndpoints(roomId);
		if ( endpointList == null ) {
			// Safe fallback (session reset)
			return new FirstRoom();
		} else {
			// Create a new room
			RemoteRoomMediator room = new RemoteRoomMediator(roomId, endpointList.getEndpoints(), threadFactory);
			return room;
		}
	}


	/**
	 * @param currentRoom
	 * @return
	 */
	public RoomMediator changeRooms(RoomMediator currentRoom, String exit) {
		RoomEndpointList roomEndpoints = null;

		if ( exit == null ) {
			// SOS!! randomly grab a new room (start over with starting rooms)
			roomEndpoints = getRoomEndpoints();
		} else {
			roomEndpoints = getRoomEndpoints(currentRoom.getId(), exit);
		}

		if ( roomEndpoints == null ) {
			// safe fallback
			return new FirstRoom();
		} else {
			return new RemoteRoomMediator(roomEndpoints.getRoomId(), roomEndpoints.getEndpoints(), threadFactory);
		}
	}

	public RoomEndpointList getRoomEndpoints() {
		WebTarget target = this.root.path("startingRoom");
		return getRoomList(target);
	}

	public RoomEndpointList getRoomEndpoints(String roomId) {
		WebTarget target = this.root.path("rooms/{roomId}").resolveTemplate("roomId", roomId);
		return getRoomList(target);
	}

	public RoomEndpointList getRoomEndpoints(String roomId, String exit) {
		WebTarget target = this.root.path("rooms/{roomId}/{exit}").resolveTemplate("roomId", roomId).resolveTemplate("exit", exit);
		return getRoomList(target);
	}

	protected RoomEndpointList getRoomList(WebTarget target) {
		Log.log(Level.FINER, this, "making request to {0} for room", target.getUri().toString());
		try {
			RoomEndpointListWrapper result = target.request(MediaType.APPLICATION_JSON).get(RoomEndpointListWrapper.class);
			return result.getRel();
		} catch (ResponseProcessingException rpe) {
			Response response = rpe.getResponse();
			Log.log(Level.FINER, this, "Exception fetching room list (%s): %s, %s",
					target.getUri().toString(),
					response.getStatusInfo());
			Log.log(Level.FINEST, this, "Exception fetching room list", rpe);
		} catch ( ProcessingException|WebApplicationException ex ) {
			Log.log(Level.FINEST, this, "Exception fetching room list ("+target.getUri().toString()+")", ex);
		}
		return null;
	}

	static class RoomEndpointListWrapper {
		RoomEndpointList rel;

		public RoomEndpointList getRel() {
			return rel;
		}

		public void setRel(RoomEndpointList rel) {
			this.rel = rel;
		}
	}

	static class RoomEndpointList {
		String roomId;
		List<String> endpoints;

		/**
		 * @return the roomId
		 */
		public String getRoomId() {
			return roomId;
		}

		/**
		 * @param roomId the roomId to set
		 */
		public void setRoomId(String roomId) {
			this.roomId = roomId;
		}

		/**
		 * @return the endpoints
		 */
		public List<String> getEndpoints() {
			return endpoints;
		}

		/**
		 * @param endpoints the endpoints to set
		 */
		public void setEndpoints(List<String> endpoints) {
			this.endpoints = endpoints;
		}
	}
}
