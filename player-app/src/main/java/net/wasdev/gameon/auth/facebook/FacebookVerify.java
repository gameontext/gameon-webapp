package net.wasdev.gameon.auth.facebook;

import java.io.IOException;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.restfb.DefaultFacebookClient;
import com.restfb.FacebookClient;
import com.restfb.FacebookClient.DebugTokenInfo;
import com.restfb.Version;

@Path("/verify/{auth}")
public class FacebookVerify {
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response verify(@PathParam("auth") String auth) throws IOException { 	
    	
    	String parts [] = auth.split("::");
    	
    	if(parts.length!=2){
    		throw new IOException("FacebookIntrospect: Bad auth "+auth);
    	}
    	
    	String type=parts[0];
    	String accesstoken=parts[1];

    	if(!"FACEBOOK".equals(type)){
    		throw new IOException("FacebookIntrospect: Bad authtype "+type);
    	}
  
    	//to verify an access token, we need a client that isn't authed with that token.
    	//so instead, we'll auth using our app token.
    	String appAccessToken = FacebookCredentials.getAppAccessToken();    	
    	FacebookClient appClient = new DefaultFacebookClient(appAccessToken, FacebookCredentials.getAppSecret(), Version.VERSION_2_5);
    	
    	//with our app token authed client, we can ask fb to verify our user's access token.
    	DebugTokenInfo tokenInfo = appClient.debugToken(accesstoken);
    	
    	//debug info has many other interesting things, but the one we'll care about for now is isValid.
    	//one day, we may wish to check if the token expired, and look into extending it etc.. 
    	if(tokenInfo.isValid()){
    		//debug
    		System.out.println(" "+tokenInfo.toString());
    		return Response.ok("{\"valid\" : \"true\"}").build();
    	}else{
    		return Response.status(401).build();
    	}
    	
    }
}
