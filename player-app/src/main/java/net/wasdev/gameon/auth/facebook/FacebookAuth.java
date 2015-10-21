package net.wasdev.gameon.auth.facebook;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.restfb.DefaultFacebookClient;
import com.restfb.FacebookClient;
import com.restfb.Version;
import com.restfb.scope.ExtendedPermissions;
import com.restfb.scope.ScopeBuilder;

@WebServlet("/FacebookAuth")
public class FacebookAuth extends HttpServlet {
	private static final long serialVersionUID = 1L;

    public FacebookAuth() {
    }
    
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		ScopeBuilder scopeBuilder = new ScopeBuilder();
		scopeBuilder.addPermission(ExtendedPermissions.EMAIL);

    	//tell facebook to send the user to this address once they have authenticated.
        StringBuffer callbackURL = request.getRequestURL();
        int index = callbackURL.lastIndexOf("/");
        callbackURL.replace(index, callbackURL.length(), "").append("/FacebookCallback");
		
		FacebookClient client = new DefaultFacebookClient(Version.VERSION_2_5);
		String loginUrl = client.getLoginDialogUrl(FacebookCredentials.getAppID(), callbackURL.toString(), scopeBuilder);

        //redirect the user to facebook to be authenticated.
        response.sendRedirect(loginUrl);
	}


}
