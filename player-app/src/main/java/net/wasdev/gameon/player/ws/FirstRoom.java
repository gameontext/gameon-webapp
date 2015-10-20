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
import java.util.Collection;
import java.util.concurrent.atomic.AtomicInteger;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;

/**
 * The first room: This is a tutorial room, shown to the user
 * when their account is first created. It does a few things like
 * make sure their profile has interesting information in it,
 * and does a little about showing how the UI works.
 */
public class FirstRoom extends Room {
	public static final String FIRST_ROOM = "TheFirstRoom";

	private final String username;
	private PlayerSession playerSession;
	private AtomicInteger counter = new AtomicInteger(0);

	/**
	 * @param username
	 */
	public FirstRoom(String username) {
		super(FIRST_ROOM);
		this.username = username;
	}

	@Override
	public Collection<? extends String> catchUp(long lastseen) {
		System.out.println("Catch-up: " + lastseen);
		return super.catchUp(lastseen);
	}

	@Override
	public void connect(PlayerSession playerSession) {
		this.playerSession = playerSession;
	}

	@Override
	public void sendToRoom(String[] routing) {
		System.out.println("sendToRoom: " + routing[2]);
		// unique to first room (in the player). Take the sent message, parse it lightly,
		// send it back to the client.
		JsonReader jsonReader = Json.createReader(new StringReader(routing[2]));
		JsonObject sourceMessage = jsonReader.readObject();

		String output = "Echo " + sourceMessage.getString("content");
		String type = "chat";


		JsonObject outgoingMessage = Json.createObjectBuilder()
				.add("messageId", counter.incrementAndGet())
				.add("username", username)
				.add("type", type)
				.add("content", output)
				.build();

		playerSession.route(new String[] {"player", username, outgoingMessage.toString()});
	}

	@Override
	public String toString() {
		return this.getClass().getName() + "[id=" + FIRST_ROOM + ", username=" + username + "]";
	}
}
