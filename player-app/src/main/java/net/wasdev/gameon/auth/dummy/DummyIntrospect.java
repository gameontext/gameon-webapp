package net.wasdev.gameon.auth.dummy;

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
import javax.ws.rs.core.Response;

import com.restfb.DefaultFacebookClient;
import com.restfb.FacebookClient;
import com.restfb.Parameter;
import com.restfb.Version;
import com.restfb.exception.FacebookOAuthException;
import com.restfb.types.User;

@Path("/introspect/{auth}")
public class DummyIntrospect {
	
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
    		throw new IOException("DummyIntrospect: Bad auth "+auth);
    	}
    	
    	String type=parts[0];
    	String accesstoken=parts[1];

    	if(!"DUMMY".equals(type)){
    		throw new IOException("DummyIntrospect: Bad authtype "+type);
    	}
		
        
	    results.put("valid","true");
	    results.put("email","anonymous@bad.address.com");
	    results.put("name",accesstoken);
	    results.put("id","dummy:"+accesstoken);
        
        return results;
	}
	
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response introspect(@PathParam("auth") String auth) throws IOException { 	
    	    	
    	Map<String,String> result = introspectAuth(auth);
    	
    	//convert an invalid status into a 400 return.
    	if(result.get("valid").equals("false")){
    		Response.status(401).build();
    	}
    	
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

        return Response.ok(sw.toString()).build();
    }
}
