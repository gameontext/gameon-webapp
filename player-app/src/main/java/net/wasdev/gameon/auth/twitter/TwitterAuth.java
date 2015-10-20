package net.wasdev.gameon.auth.twitter;

import java.io.IOException;

import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.auth.RequestToken;
import twitter4j.conf.ConfigurationBuilder;


@WebServlet("/TwitterAuth")
public class TwitterAuth extends HttpServlet {
	private static final long serialVersionUID = 1L;

    public TwitterAuth() {
    }
    
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		ConfigurationBuilder c = new ConfigurationBuilder();		
		c.setOAuthConsumerKey(TwitterCredentials.getConsumerKey()).setOAuthConsumerSecret(TwitterCredentials.getConsumerSecret());
		 
        Twitter twitter = new TwitterFactory(c.build()).getInstance();
        request.getSession().setAttribute("twitter", twitter);
        
        try {        
        	//twitter will tell the users browser to go to this address once they are done authing.
            StringBuffer callbackURL = request.getRequestURL();
            int index = callbackURL.lastIndexOf("/");
            callbackURL.replace(index, callbackURL.length(), "").append("/TwitterCallback");

            //to initiate an auth request, twitter needs us to have a request token. 
            RequestToken requestToken = twitter.getOAuthRequestToken(callbackURL.toString());
            
            //stash the request token in the session.
            request.getSession().setAttribute("requestToken", requestToken);
            
            //send the user to twitter to be authenticated.
            response.sendRedirect(requestToken.getAuthenticationURL());
            
        } catch (TwitterException e) {
            throw new ServletException(e);
        }
	    
	}

}
