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
		switch(routing[0]) {
			case Constants.ROOM_HELLO :
			case Constants.ROOM_GOODBYE :
				Log.log(Level.FINER, this, "{0} {1}", routing[0], routing[2]);
				break;
			default :
				JsonReader jsonReader = Json.createReader(new StringReader(routing[2]));
				JsonObject sourceMessage = jsonReader.readObject();

				JsonObjectBuilder builder = Json.createObjectBuilder();

				parseCommand(sourceMessage, builder);
				builder.add(Constants.BOOKMARK, counter.incrementAndGet());
				JsonObject response = builder.build();

				String target = Constants.PLAYER;
				if ( response.containsKey(Constants.EXIT_ID) ) {
					target = Constants.PLAYER_LOCATION;
				}
				session.sendToClient(new String[] {target, sourceMessage.getString(Constants.USER_ID), response.toString()});
		}
	}

	protected void parseCommand(JsonObject sourceMessage, JsonObjectBuilder responseBuilder) {
		String content = sourceMessage.getString(Constants.CONTENT);
		String contentToLower = content.toLowerCase();


		// The First Room will just look for the leading / with a few verbs.
		// Other rooms may go for more complicated grammar (though leading slash will be prevalent).
		if ( contentToLower.startsWith("/look")) {
			responseBuilder.add(Constants.TYPE, Constants.EVENT)
			.add(Constants.CONTENT, "");
		} else if ( contentToLower.startsWith("/exit") || contentToLower.startsWith("/go") ) {
			responseBuilder.add(Constants.TYPE, Constants.EXIT)
			.add(Constants.EXIT_ID, "N")
			.add(Constants.CONTENT, "You've found a way out, well done!");
		} else {
			responseBuilder.add(Constants.USERNAME, sourceMessage.getString(Constants.USERNAME))
			.add(Constants.CONTENT, "echo " + content)
			.add(Constants.TYPE, Constants.CHAT);
		}
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
