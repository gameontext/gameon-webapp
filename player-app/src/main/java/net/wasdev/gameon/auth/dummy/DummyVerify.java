package net.wasdev.gameon.auth.dummy;

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
public class DummyVerify {
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response verify(@PathParam("auth") String auth) throws IOException { 	
    	
    	String parts [] = auth.split("::");
    	
    	if(parts.length!=2){
    		throw new IOException("DummyIntrospect: Bad auth "+auth);
    	}
    	
    	String type=parts[0];
    	String accesstoken=parts[1];

    	if(!"DUMMY".equals(type)){
    		throw new IOException("DummyIntrospect: Bad authtype "+type);
    	}
    	
		System.out.println(" "+accesstoken.toString());
		return Response.ok("{\"valid\" : \"true\"}").build();  	
    }
}
