package net.wasdev.gameon.auth.twitter;

import java.io.IOException;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.conf.ConfigurationBuilder;

@Path("/verify/{auth}")
public class TwitterVerify {
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String verify(@PathParam("auth") String auth) throws IOException { 	
    	
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
        	//if the token as expired / been revoked, a TwitterException will be thrown
			twitter.verifyCredentials();	
			return "{ \"valid\" : \"true\" }";
		} catch (TwitterException e) {
			return "{ \"valid\" : \"false\" }";
		}

    }
}
