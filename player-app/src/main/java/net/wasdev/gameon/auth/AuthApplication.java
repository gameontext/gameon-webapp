package net.wasdev.gameon.auth;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

@ApplicationPath("/auth/*")
public class AuthApplication extends Application {
	
	public final static Set<Class<?>> authJaxRSClasses = new HashSet<Class<?>>(Arrays.asList(new Class<?>[]{Auth.class}));
	
	@Override
	public Set<Class<?>> getClasses() {
		return authJaxRSClasses;
	}
	
	
}