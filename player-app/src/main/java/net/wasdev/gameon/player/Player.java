package net.wasdev.gameon.player;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.ext.Providers;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;

public class Player {
	@Context Providers ps;
	
	public Player(){}
	
	public Player(String name, String authBy, String location, String favoriteColor) {
		super();
		this.name = name;
		this.authBy = authBy;
		this.location = location;
		this.favoriteColor = favoriteColor;
	}
	
	private String name;
	private String authBy;
	private String location;
	private String favoriteColor;
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getAuthBy() {
		return authBy;
	}
	public void setAuthBy(String authBy) {
		this.authBy = authBy;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}
	public String getFavoriteColor() {
		return favoriteColor;
	}
	public void setFavoriteColor(String favoriteColor) {
		this.favoriteColor = favoriteColor;
	}
	
	static public Player fromDBObject(Providers ps,DBObject player) throws IOException{
		DBObject p2 = new BasicDBObject();
		p2.putAll(player);
		p2.removeField("_id");
		Player p = ps.getMessageBodyReader(Player.class, null,null, MediaType.APPLICATION_JSON_TYPE).readFrom(Player.class, Player.class, null, MediaType.APPLICATION_JSON_TYPE, null, new ByteArrayInputStream(p2.toString().getBytes()));
	   	return p;
	}
	public DBObject toDBObject() throws IOException{
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
    	ps.getMessageBodyWriter(Player.class, null,null, MediaType.APPLICATION_JSON_TYPE).writeTo(this,Player.class, null,null, MediaType.APPLICATION_JSON_TYPE, null, baos);
    	String json = baos.toString();//default charset.
    	DBObject playerToStore = (DBObject) JSON.parse(json);
    	return playerToStore;
	}

}
