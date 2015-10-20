package net.wasdev.gameon.auth.facebook;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

@ApplicationPath("/facebook/*")
public class FacebookApplication extends Application {
	
	public final static Set<Class<?>> facebookJaxRSClasses = new HashSet<Class<?>>(Arrays.asList(new Class<?>[]{FacebookVerify.class,FacebookIntrospect.class}));
	
	@Override
	public Set<Class<?>> getClasses() {
		return facebookJaxRSClasses;
	}
}
