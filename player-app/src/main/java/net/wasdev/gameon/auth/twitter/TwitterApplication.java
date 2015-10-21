package net.wasdev.gameon.auth.twitter;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

@ApplicationPath("/twitter/*")
public class TwitterApplication extends Application {

	public final static Set<Class<?>> twitterJaxRSClasses = new HashSet<Class<?>>(Arrays.asList(new Class<?>[]{TwitterVerify.class,TwitterIntrospect.class}));
		
	@Override
	public Set<Class<?>> getClasses() {
		return twitterJaxRSClasses;
	}

}
