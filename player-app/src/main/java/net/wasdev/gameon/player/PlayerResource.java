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
package net.wasdev.gameon.player;

import java.io.IOException;
import java.net.UnknownHostException;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Providers;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;

/**
 * The Player service, where players remember where they are, and what they have
 * in their pockets.
 *
 */
@Path("/players/{username}")
public class PlayerResource {
	@Context Providers ps;
	
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Player getPlayerInformation(@PathParam("username") String username) throws UnknownHostException,IOException { 	
		DBCollection players = PlayerApplication.playerDB.getCollection("players");
    	DBObject query = new BasicDBObject("name",username);
    	DBCursor cursor = players.find(query);
    	if(!cursor.hasNext()){
    		//will be mapped to 404 by the PlayerExceptionMapper
    		throw new PlayerNotFoundException("username not found : "+username);
    	}       	
    	DBObject player = cursor.one();  
    	Player p = Player.fromDBObject(ps, player);   	
    	return p;
    }
    
    @PUT
    public Response updatePlayer(@PathParam("username") String username, Player newPlayer) throws UnknownHostException, IOException { 	
		DBCollection players = PlayerApplication.playerDB.getCollection("players");
    	DBObject query = new BasicDBObject("name",username);
    	DBCursor cursor = players.find(query);
    	if(!cursor.hasNext()){
    		//will be mapped to 404 by the PlayerExceptionMapper
    		throw new PlayerNotFoundException("username not found : "+username);
    	}        	
    	DBObject player = cursor.one(); 
    	DBObject nPlayer = newPlayer.toDBObject();
    	   	
    	players.update(player, nPlayer);
    	return Response.status(204).build();
    }
    
    @DELETE
    public Response removePlayer(@PathParam("username") String username) throws UnknownHostException { 	
		DBCollection players = PlayerApplication.playerDB.getCollection("players");
    	DBObject query = new BasicDBObject("name",username);
    	DBCursor cursor = players.find(query);
    	if(!cursor.hasNext()){
    		//will be mapped to 404 by the PlayerExceptionMapper
    		throw new PlayerNotFoundException("username not found : "+username);
    	}        	
    	DBObject player = cursor.one();  
    	players.remove(player);
    	return Response.status(200).build();
    }
}
