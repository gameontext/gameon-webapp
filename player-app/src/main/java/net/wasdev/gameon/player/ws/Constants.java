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
	String ROOM_NAME = "roomName";
	String ROOM_HELLO = "roomHello";
	String ROOM_GOODBYE = "roomGoodbye";

	String PLAYER = "player";
	String PLAYER_LOCATION = "playerLocation";
	String SOS = "sos";

	String FIRST_ROOM = "TheFirstRoom";
	String FIRST_ROOM_DESC = "You've entered a vaguely squarish room, with walls of an indeterminate color.";
	String FIRST_ROOM_INV = "Sadly, there is nothing here";

	// Perhaps a type enum would work better
	String TYPE = "type";
	String CHAT = "chat";
	String EVENT = "event";
	String EXIT = "exit";

	String LOCATION = "location";
	String NAME = "name";
	String DESCRIPTION = "description";
	String EXITS = "exits";

	String MEDIATOR_ID = "mediatorId";
	String ROOM_ID = "roomId";
	String EXIT_ID = "exitId";
	String BOOKMARK = "bookmark";

	String USERNAME = "username";
	String USER_ID = "userId";
	String CONTENT = "content";

	String NETHER_REGION = "player,%s,{\"type\": \"event\",\"content\": {\"*\": \"You feel a strange sensation, and suddenly find yourself in a nebulous, gray area with no apparent usable doors.\"},\"bookmark\": 0}";
	String LIFE_RING = "player,%s,{\"type\": \"exit\",\"content\": \"In a desperate plea for rescue, you stick out your <a href='http://everything2.com/title/Electronic+Thumb' target='_blank'>Electric Thumb</a> and hope for the best.\",\"bookmark\": 0}";

	String JOIN = "player,%s,{\"type\": \"joinpart\",\"content\": \"enter %s\",\"bookmark\": 0}";
	String PART = "player,%s,{\"type\": \"joinpart\",\"content\": \"exit %s\",\"bookmark\": 0}";
}
