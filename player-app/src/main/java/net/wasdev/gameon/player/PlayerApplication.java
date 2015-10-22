package net.wasdev.gameon.player;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

@ApplicationPath("/players/*")
public class PlayerApplication extends Application {
	
	public final static Set<Class<?>> playerJaxRSClasses = new HashSet<Class<?>>(Arrays.asList(new Class<?>[]{AllPlayersResource.class,PlayerResource.class,Player.class,PlayerExceptionMapper.class}));
	
	@Override
	public Set<Class<?>> getClasses() {
		return playerJaxRSClasses;
	}
}
