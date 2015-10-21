package net.wasdev.gameon.auth.twitter;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import twitter4j.ResponseList;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.User;
import twitter4j.conf.ConfigurationBuilder;

@Path("/introspect/{auth}")
public class TwitterIntrospect {
	
	/**
	 * Method that performs introspection on an AUTH string, and returns data as 
	 * a String->String hashmap. 
	 * 
	 * @param auth the authstring to query, as built by an auth impl.
	 * @return the data from the introspect, in a map.
	 * @throws IOException if anything goes wrong.
	 */
	public Map<String,String> introspectAuth(String auth) throws IOException{
		Map<String,String> results = new HashMap<String,String>();
    	
    	String parts [] = auth.split("::");
    	String type=parts[0];
    	String token=parts[1];
    	String tokensecret=parts[2];
    	String userid=parts[3];
    	
    	if(!"TWITTER".equals(type)){
    		throw new IOException("TwitterIntrospect: Bad authtype "+type);
    	}
    	    	    	       
		ConfigurationBuilder c = new ConfigurationBuilder();
		c.setOAuthConsumerKey(TwitterCredentials.getConsumerKey())
		 .setOAuthConsumerSecret(TwitterCredentials.getConsumerSecret())
		 .setOAuthAccessToken(token)
		 .setOAuthAccessTokenSecret(tokensecret);
		 
        Twitter twitter = new TwitterFactory(c.build()).getInstance();
        
        try {
        	//ask twitter to verify the token & tokensecret from the auth string
        	//if invalid, it'll throw a TwitterException
			twitter.verifyCredentials();	
			
			//if it's valid, lets grab a little more info about the user.
			long id = twitter.getId();
			ResponseList<User> users = twitter.lookupUsers(id);
			User u = users.get(0);
			String name = u.getName();
			String screenname = u.getScreenName();
			
			results.put("valid", "true");
			results.put("id", "twitter:"+id);
			results.put("name", name);
			results.put("screenname",screenname);
			
		} catch (TwitterException e) {
			results.put("valid", "false");
		}
        
        return results;
	}
	
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String introspect(@PathParam("auth") String auth) throws IOException { 	
    	Map<String,String> result = introspectAuth(auth);
    	
    	//serialize out the map as json.. 
    	//TBD: use something a little more elegant.. even json4j
    	
    	StringWriter sw = new StringWriter();
    	PrintWriter out = new PrintWriter(sw);
        out.print("{");
        boolean first=true;
        for(Map.Entry<String, String>pair : result.entrySet()){
	        out.println(first?"":",");
	        out.print(" \""+pair.getKey()+"\" : \""+pair.getValue()+"\"");
	        first=false;
        }
        out.println("\n}");
        out.close();

        return sw.toString();
    }
}
