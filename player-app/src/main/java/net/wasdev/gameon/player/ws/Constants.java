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

/**
 * @author elh
 *
 */
public interface Constants {

	String ROOM = "room";
	String ROOM_HELLO = "roomHello";
	String ROOM_GOODBYE = "roomGoodbye";

	String PLAYER = "player";
	String PLAYER_LOCATION = "playerLocation";
	String SOS = "sos";

	String FIRST_ROOM = "TheFirstRoom";

	// Perhaps a type enum would work better
	String TYPE = "type";
	String CHAT = "chat";
	String EVENT = "event";

	String MEDIATOR_ID = "mediatorId";
	String ROOM_ID = "roomId";
	String BOOKMARK = "bookmark";

	String USERNAME = "username";
	String USER_ID = "userId";
	String CONTENT = "content";

	String NETHER_REGION = null;
}
