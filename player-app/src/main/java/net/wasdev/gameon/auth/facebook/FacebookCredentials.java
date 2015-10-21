package net.wasdev.gameon.auth.facebook;

import java.io.IOException;

import javax.naming.InitialContext;
import javax.naming.NamingException;

import com.restfb.DefaultFacebookClient;
import com.restfb.FacebookClient;
import com.restfb.Version;
import com.restfb.FacebookClient.AccessToken;

/**
 * Utility class to obtain the facebook app id/secret from jndi, 
 * then make it available to the rest of the code.
 */
public class FacebookCredentials {

	private volatile static String facebookAppID=null;
	private volatile static String facebookAppSecret=null;
	
	private synchronized static void readfacebookCredentials() throws IOException{
				
		String key = null;
		String secret = null;
		try{
			key = new InitialContext().lookup("facebookAppID").toString();
			secret = new InitialContext().lookup("facebookAppSecret").toString();

			FacebookCredentials.facebookAppID = key;
			FacebookCredentials.facebookAppSecret = secret;
		}catch(NamingException e){
			throw new IOException(e);
		}
	}
	
	public static String getAppID() throws IOException{
		if(facebookAppID==null){
			readfacebookCredentials();
		}
		return facebookAppID;
	}
	public static String getAppSecret() throws IOException{
		if(facebookAppSecret==null){
			readfacebookCredentials();
		}
		return facebookAppSecret;
	}

	/**
	 * The app access token is a token that allows actions to be carried out as the app, 
	 * not as the end user. We use this for token verification, and because it's only 
	 * based on the info this class holds, this class might as well look after the app 
	 * access token too.
	 * 
	 * @return the app access token
	 * @throws IOException if anything goes wrong.
	 */
	public static String getAppAccessToken() throws IOException{
		if(facebookAppID==null || facebookAppSecret==null){
			readfacebookCredentials();
		}  	
    	FacebookClient genericClient = new DefaultFacebookClient(Version.VERSION_2_5);
    	AccessToken appAccessToken = genericClient.obtainAppAccessToken(getAppID(), getAppSecret());
    	return appAccessToken.getAccessToken();
	}
}
