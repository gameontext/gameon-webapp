package net.wasdev.gameon.auth.facebook;

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

import com.restfb.DefaultFacebookClient;
import com.restfb.FacebookClient;
import com.restfb.Parameter;
import com.restfb.Version;
import com.restfb.exception.FacebookOAuthException;
import com.restfb.types.User;

@Path("/introspect/{auth}")
public class FacebookIntrospect {
	
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
    	
    	if(parts.length!=2){
    		throw new IOException("FacebookIntrospect: Bad auth "+auth);
    	}
    	
    	String type=parts[0];
    	String accesstoken=parts[1];

    	if(!"FACEBOOK".equals(type)){
    		throw new IOException("FacebookIntrospect: Bad authtype "+type);
    	}
		
    	//create a fb client using the supplied access token
        FacebookClient client = new DefaultFacebookClient(accesstoken, Version.VERSION_2_5);
        
        try{
        	//get back just the email, and name for the user, we'll get the id for free.
        	//fb only allows us to retrieve the things we asked for back in FacebookAuth when creating the token.
	        User userWithMetadata = client.fetchObject("me", User.class, Parameter.with("fields", "email,name"));
	        
	        results.put("valid","true");
	        results.put("email",userWithMetadata.getEmail());
	        results.put("name",userWithMetadata.getName());
	        results.put("id","facebook:"+userWithMetadata.getId());

        }catch(FacebookOAuthException e){
        	results.clear();
	        results.put("valid","false");
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
