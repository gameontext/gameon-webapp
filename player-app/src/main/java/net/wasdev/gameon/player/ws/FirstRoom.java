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
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Level;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonReader;
import javax.websocket.CloseReason;

/**
 *
 */
public class FirstRoom implements RoomMediator {

	PlayerConnectionMediator session= null;
	private AtomicInteger counter = new AtomicInteger(0);

	@Override
	public void route(String[] routing) {
		Log.log(Level.FINEST, this, "TheFirstRoom received: {0}", String.join(",", routing));

		JsonReader jsonReader = Json.createReader(new StringReader(routing[2]));
		JsonObject sourceMessage = jsonReader.readObject();

		JsonObjectBuilder builder = Json.createObjectBuilder();
		builder.add(Constants.BOOKMARK, counter.incrementAndGet());
		switch(routing[0]) {
			case Constants.ROOM_HELLO :
				buildLocationResponse(builder);
				break;
			case Constants.ROOM_GOODBYE :
				// no response for roomGoodbye
				return;
			default :
				parseCommand(sourceMessage, builder);
		}


		JsonObject response = builder.build();

		String target = Constants.PLAYER;
		if ( response.containsKey(Constants.EXIT_ID) ) {
			target = Constants.PLAYER_LOCATION;
		}
		session.sendToClient(new String[] {target, sourceMessage.getString(Constants.USER_ID), response.toString()});
	}

	protected void parseCommand(JsonObject sourceMessage, JsonObjectBuilder responseBuilder) {
		String content = sourceMessage.getString(Constants.CONTENT);
		String contentToLower = content.toLowerCase();

		// The First Room will just look for the leading / with a few verbs.
		// Other rooms may go for more complicated grammar (though leading slash will be prevalent).
		if ( contentToLower.startsWith("/look")) {
			responseBuilder.add(Constants.TYPE, Constants.EVENT)
			.add(Constants.CONTENT, "");
		} else if ( contentToLower.startsWith("/exits") ) {
			responseBuilder.add(Constants.TYPE, Constants.EXITS)
			.add(Constants.CONTENT, buildExitsResponse());
		} else if ( contentToLower.startsWith("/exit") || contentToLower.startsWith("/go ") ) {
			responseBuilder.add(Constants.TYPE, Constants.EXIT)
			.add(Constants.EXIT_ID, "N")
			.add(Constants.CONTENT, "You've found a way out, well done!");
		} else if ( contentToLower.startsWith("/inventory") ) {
			responseBuilder.add(Constants.TYPE, Constants.EVENT)
			.add(Constants.CONTENT, buildContentResponse("You do not appear to be carrying anything"));
		} else {
			responseBuilder.add(Constants.USERNAME, sourceMessage.getString(Constants.USERNAME))
			.add(Constants.CONTENT, "echo " + content)
			.add(Constants.TYPE, Constants.CHAT);
		}
	}

	private JsonObject buildContentResponse(String message) {
		JsonObjectBuilder content = Json.createObjectBuilder();
		content.add("*", message);
		return content.build();
	}

	private void buildLocationResponse(JsonObjectBuilder responseBuilder) {
		responseBuilder.add(Constants.TYPE, Constants.LOCATION);
		responseBuilder.add(Constants.NAME, Constants.FIRST_ROOM);
		responseBuilder.add(Constants.DESCRIPTION, Constants.FIRST_ROOM_DESC);
		responseBuilder.add(Constants.EXITS, buildExitsResponse());
	}

	private JsonObject buildExitsResponse() {
		JsonObjectBuilder content = Json.createObjectBuilder();
		content.add("N", "Simple door to the North (/exit N)");
		content.add("S", "Simple door to the South (/exit S)");
		content.add("E", "Simple door to the East (/exit E)");
		content.add("W", "Simple door to the West (/exit W)");
		content.add("U", "Hatch in the ceiling (/exit U)");
		content.add("D", "Trap-door in the floor (/exit D)");

		return content.build();
	}

	@Override
	public boolean subscribe(PlayerConnectionMediator playerSession, long lastmessage) {
		this.session = playerSession;
		return true;
	}

	@Override
	public void unsubscribe(PlayerConnectionMediator playerSession) {
	}

	@Override
	public String getId() {
		return Constants.FIRST_ROOM;
	}

	@Override
	public void disconnect(CloseReason reason) {
	}

}
