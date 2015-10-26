package net.wasdev.gameon.auth.dummy;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

@ApplicationPath("/dummy/*")
public class DummyApplication extends Application {
	
	public final static Set<Class<?>> dummykJaxRSClasses = new HashSet<Class<?>>(Arrays.asList(new Class<?>[]{DummyVerify.class,DummyIntrospect.class}));
	
	@Override
	public Set<Class<?>> getClasses() {
		return dummykJaxRSClasses;
	}
}
