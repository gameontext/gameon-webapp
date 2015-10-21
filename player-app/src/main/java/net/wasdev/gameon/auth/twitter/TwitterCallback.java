package net.wasdev.gameon.auth.twitter;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.auth.AccessToken;
import twitter4j.auth.RequestToken;

/**
 * Servlet implementation class TwitterCallback
 */
@WebServlet("/TwitterCallback")
public class TwitterCallback extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    public TwitterCallback() {
        super();
    }

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {		
		//twitter calls us back at this app when a user has finished authing with them.
		//when it calls us back here, it passes an oauth_verifier token that we can exchange
		//for a twitter access token.
		
		//we stashed our twitter & request token into the session, we'll need those to do the exchange 
        Twitter twitter = (Twitter) request.getSession().getAttribute("twitter");
        RequestToken requestToken = (RequestToken) request.getSession().getAttribute("requestToken");
        
        //grab the verifier token from the request parms.
        String verifier = request.getParameter("oauth_verifier");
        
        String auth = "";
        try {
        	//swap the verifier token for an access token
            AccessToken token = twitter.getOAuthAccessToken(requestToken, verifier);
            
            //build the auth string we'll use, prefixing with this service to keep it unique.
            auth = "TWITTER::"+token.getToken()+"::"+token.getTokenSecret()+"::"+token.getUserId();
            
            //debug.
            System.out.println(auth);
            
            //clean up the session as we go (can leave twitter there if we need it again).
            request.getSession().removeAttribute("requestToken");
        } catch (TwitterException e) {
            throw new ServletException(e);
        }
        
        //TBD: send the user onto the post login url.. we don't know what that is yet.
        //     for now we'll send them to the generic auth introspection url.
        response.sendRedirect(request.getContextPath() + "/auth/introspect/"+auth);
	}


}
