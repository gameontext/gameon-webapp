package net.wasdev.gameon.auth.facebook;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.restfb.DefaultFacebookClient;
import com.restfb.DefaultWebRequestor;
import com.restfb.FacebookClient;
import com.restfb.WebRequestor;

@WebServlet("/FacebookCallback")
public class FacebookCallback extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    public FacebookCallback() {
        super();
    }
    
    /**
     * Utility method to obtain an accesstoken given a facebook code and the redirecturl used to obtain it.
     * @param code
     * @param redirectUrl
     * @return the acccess token
     * @throws IOException if anything goes wrong.
     */
    private FacebookClient.AccessToken getFacebookUserToken(String code, String redirectUrl) throws IOException {
        String appId = FacebookCredentials.getAppID();
        String secretKey = FacebookCredentials.getAppSecret();

        //restfb doesn't seem to have an obvious method to convert a response code into an access token
        //but according to the spec, this is the easy way to do it.. we'll use WebRequestor from restfb to 
        //handle the request/response.
        
        WebRequestor wr = new DefaultWebRequestor();
        WebRequestor.Response accessTokenResponse = wr.executeGet(
                "https://graph.facebook.com/oauth/access_token?client_id=" + appId + "&redirect_uri=" + redirectUrl
                + "&client_secret=" + secretKey + "&code=" + code);

        //finally, restfb can now process the reply to get us our access token.        
        return DefaultFacebookClient.AccessToken.fromQueryString(accessTokenResponse.getBody());
    }

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
      
		//facebook redirected to us, and there should be a code awaiting us as part of the request.
        String code = request.getParameter("code");
        
    	//need the redirect url for fb to give us a token from the code it supplied.
        StringBuffer callbackURL = request.getRequestURL();
        int index = callbackURL.lastIndexOf("/");
        callbackURL.replace(index, callbackURL.length(), "").append("/FacebookCallback");
        
        //convert the code into an access token.
        FacebookClient.AccessToken token = getFacebookUserToken(code, callbackURL.toString());
        
        String accessToken = token.getAccessToken();
        
        //prefix the token with this service id so it can be differentiated later.
        String auth = "FACEBOOK::"+accessToken;
        
        //debug.
        System.out.println(auth);
        
        //TBD: this sends the user onto the 'post login' url.. which for now is just the generic auth introspection url.
        response.sendRedirect(request.getContextPath() + "/auth/introspect/"+auth);
	}


}
