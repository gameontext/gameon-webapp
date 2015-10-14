package net.wasdev.gameon.player;

import java.io.ByteArrayOutputStream;
import java.net.UnknownHostException;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.ext.Providers;

import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.util.JSON;

@ApplicationPath("/*")
public class PlayerApplication extends Application {
	@Context Providers ps;
	
	public static DB playerDB=null;
	
	public PlayerApplication() {
		try {
			MongoClient mongoClient = new MongoClient(new MongoClientURI("mongodb://localhost:27017"));		
			playerDB = mongoClient.getDB("playerDB");
			DBCollection players = playerDB.getCollection("players");
			
			//if there are no players, lets add a default one.
			if(players.count() == 0){
				Player p = new Player("Ozzy","internal","home","gold");
				
				ByteArrayOutputStream baos = new ByteArrayOutputStream();
		    	ps.getMessageBodyWriter(Player.class, null,null, MediaType.APPLICATION_JSON_TYPE).writeTo(p,Player.class, null,null, MediaType.APPLICATION_JSON_TYPE, null, baos);
		    	String json = baos.toString();//default charset.
		    	DBObject player = (DBObject) JSON.parse(json);

				players.insert(player);
			}
			
		} catch (UnknownHostException e) {
			System.out.println("Error connecting to mongo, unknwon host "+e.getMessage());
		} catch (Exception e){
			System.out.println("oof "+e);
			e.printStackTrace();
		}
	}
}
