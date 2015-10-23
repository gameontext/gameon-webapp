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
	
	@GET
	@Path("/verify/{auth}")
    @Produces(MediaType.APPLICATION_JSON)
	public Response verify(@PathParam("auth") String auth) throws IOException {
		if(auth.startsWith("TWITTER::")){
			return tv.verify(auth);
		}else if (auth.startsWith("FACEBOOK::")){
			return fv.verify(auth);
		}
		return Response.status(400).build();
	}
	
	@GET
	@Path("/introspect/{auth}")
    @Produces(MediaType.APPLICATION_JSON)
	public Response introspect(@PathParam("auth") String auth) throws IOException {
		if(auth.startsWith("TWITTER::")){
			return ti.introspect(auth);
		}else if (auth.startsWith("FACEBOOK::")){
			return fi.introspect(auth);
		}
		return Response.status(400).build();
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
