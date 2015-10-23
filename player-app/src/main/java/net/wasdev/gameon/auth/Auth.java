package net.wasdev.gameon.auth;

import java.io.FileInputStream;
import java.io.IOException;
import java.security.Key;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.util.Calendar;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import net.wasdev.gameon.auth.facebook.FacebookIntrospect;
import net.wasdev.gameon.auth.facebook.FacebookVerify;
import net.wasdev.gameon.auth.twitter.TwitterIntrospect;
import net.wasdev.gameon.auth.twitter.TwitterVerify;

@Path("/")
public class Auth {

	TwitterVerify tv = new TwitterVerify();
	TwitterIntrospect ti = new TwitterIntrospect();
	
	FacebookVerify fv = new FacebookVerify();
	FacebookIntrospect fi = new FacebookIntrospect();
	
	
	private static class TimeStampedResponse{
		long timestamp;
		String verifyResponse;
		String introspectResponse;
	}
	private static class CacheHashMap<K, T extends TimeStampedResponse> extends LinkedHashMap<K, T> {
		private static final long serialVersionUID = 1L;
		private final int maxSize;

	    public CacheHashMap(int maxSize) {
	        this(maxSize, 16, .75f, true);
	    }

	    public CacheHashMap(int maxSize, int initialCapacity, float loadFactor, boolean accessOrder) {
	        super(initialCapacity, loadFactor, accessOrder);
	        this.maxSize = maxSize;
	    }	    

	    @Override
	    protected boolean removeEldestEntry(Map.Entry<K, T> eldest) {
	        return size() > maxSize;
	    }
	}
	
	private static CacheHashMap<String, TimeStampedResponse> cache = new CacheHashMap<String, TimeStampedResponse>(50);
	private static final int MAXAGE = 1000*60*15; //15m as ms. 
	
	@GET
	@Path("/verify/{auth}")
    @Produces(MediaType.APPLICATION_JSON)
	public Response verify(@PathParam("auth") String auth) throws IOException {
		TimeStampedResponse t = cache.get(auth);
		Response r = Response.status(400).build();
		if(t!=null && t.verifyResponse!=null && (System.currentTimeMillis()-t.timestamp)<MAXAGE){
			System.out.println("Using cached verify response for auth "+auth);
			r = Response.ok(t.verifyResponse).build(); 
		}else{
			if(auth.startsWith("TWITTER::")){
				r = tv.verify(auth);
			}else if (auth.startsWith("FACEBOOK::")){
				r = fv.verify(auth);
			}
			if(r.getStatus()!=400){
				if(r.getStatus()==200){					
					synchronized(cache){
						TimeStampedResponse newT;
						if(!cache.containsKey(auth)){
							newT = new TimeStampedResponse();
							cache.put(auth, newT);
						}else{
							newT = cache.get(auth);
							//refresh the entry in the map.. (because we are removing oldest entries from the map)
							cache.put(auth, newT);
						}						
						newT.timestamp = System.currentTimeMillis();
						newT.verifyResponse = r.getEntity().toString();
					}
				}
			}
		}
		return r;
	}
	
	@GET
	@Path("/introspect/{auth}")
    @Produces(MediaType.APPLICATION_JSON)
	public Response introspect(@PathParam("auth") String auth) throws IOException {
		TimeStampedResponse t = cache.get(auth);
		Response r = Response.status(400).build();
		if(t!=null && t.introspectResponse!=null && (System.currentTimeMillis()-t.timestamp)<MAXAGE){
			System.out.println("Using cached introspect response for auth "+auth);
			r = Response.ok(t.introspectResponse).build(); 
		}else{
			if(auth.startsWith("TWITTER::")){
				r = ti.introspect(auth);
			}else if (auth.startsWith("FACEBOOK::")){
				r = fi.introspect(auth);
			}
			if(r.getStatus()!=400){
				if(r.getStatus()==200){					
					synchronized(cache){
						TimeStampedResponse newT;
						if(!cache.containsKey(auth)){
							newT = new TimeStampedResponse();
							cache.put(auth, newT);
						}else{
							newT = cache.get(auth);
							//refresh the entry in the map.. (because we are removing oldest entries from the map)
							cache.put(auth, newT);
						}						
						newT.timestamp = System.currentTimeMillis();
						newT.introspectResponse = r.getEntity().toString();
					}
				}
			}
		}
		return r;
	}
	
	private static Key signingKey = null;
	
	private synchronized static void getKeyStoreInfo() throws IOException{
		String keyStore = null;
		String keyStorePW = null;
		String keyStoreAlias = null;
		try{
			keyStore = new InitialContext().lookup("jwtKeyStore").toString();
			keyStorePW = new InitialContext().lookup("jwtKeyStorePassword").toString();
			keyStoreAlias = new InitialContext().lookup("jwtKeyStoreAlias").toString();
			
			//load up the keystore..
			FileInputStream is = new FileInputStream(keyStore);
			KeyStore signingKeystore = KeyStore.getInstance(KeyStore.getDefaultType());
			signingKeystore.load(is,keyStorePW.toCharArray());

			//grab the key we'll use to sign
			signingKey = signingKeystore.getKey(keyStoreAlias,keyStorePW.toCharArray());
			
		}catch(NamingException e){
			throw new IOException(e);
		}catch(KeyStoreException e){
			throw new IOException(e);
		}catch(NoSuchAlgorithmException e){
			throw new IOException(e);
		}catch(CertificateException e){
			throw new IOException(e);
		}catch(UnrecoverableKeyException e){
			throw new IOException(e);
		}
		
	}
	
	@GET
	@Path("/jwt/{auth}")
    @Produces(MediaType.APPLICATION_JSON)
	public Response generateJWT(@PathParam("auth") String auth) throws IOException {
		
		if(signingKey==null)
			getKeyStoreInfo();

		Map<String,String> data = new HashMap<String,String>();
		
		if(auth.startsWith("TWITTER::")){
			data =  ti.introspectAuth(auth);
		}else if (auth.startsWith("FACEBOOK::")){
			data =  fi.introspectAuth(auth);
		}
		
		//if auth key was no longer valid, we won't build a jwt.
		if(!"true".equals(data.get("valid"))){
			return Response.status(400).build();
		}
		
		Claims onwardsClaims = Jwts.claims();
		
		//add in the subject & scopes from the token introspection	
		onwardsClaims.setSubject(data.get("id"));

		onwardsClaims.putAll(data);
		
		//set a very short lifespan for the new jwt of 30 seconds.
		Calendar calendar = Calendar.getInstance();
		calendar.add(Calendar.SECOND,30);
		onwardsClaims.setExpiration(calendar.getTime());
		//finally build the new jwt, using the claims we just built, signing it with our
		//signing key, and adding a key hint as kid to the encryption header, which is
		//optional, but can be used by the receivers of the jwt to know which key
		//they should verifiy it with.
		String newJwt = Jwts.builder().setHeaderParam("kid","playerssl").setClaims(onwardsClaims).signWith(SignatureAlgorithm.RS256,signingKey).compact();

		return Response.ok("{ \"jwt\" : \""+newJwt+"\" }").build();		
	}
}
