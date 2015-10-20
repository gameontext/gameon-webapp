package net.wasdev.gameon.auth.twitter;

import java.io.IOException;

import javax.naming.InitialContext;
import javax.naming.NamingException;

/**
 * Utility class to obtain the twitter app key/secret from jndi, 
 * then make it available to the rest of the code.
 */
public class TwitterCredentials {

	private volatile static String twitterOAuthConsumerKey=null;
	private volatile static String twitterOAuthConsumerSecret=null;
	
	private synchronized static void readTwitterCredentials() throws IOException{
				
		String key = null;
		String secret = null;
		try{
			key = new InitialContext().lookup("twitterOAuthConsumerKey").toString();
			secret = new InitialContext().lookup("twitterOAuthConsumerSecret").toString();

			TwitterCredentials.twitterOAuthConsumerKey = key;
			TwitterCredentials.twitterOAuthConsumerSecret = secret;
		}catch(NamingException e){
			throw new IOException(e);
		}
	}
	
	public static String getConsumerKey() throws IOException{
		if(twitterOAuthConsumerKey==null){
			readTwitterCredentials();
		}
		return twitterOAuthConsumerKey;
	}
	public static String getConsumerSecret() throws IOException{
		if(twitterOAuthConsumerSecret==null){
			readTwitterCredentials();
		}
		return twitterOAuthConsumerSecret;
	}
}
