package net.wasdev.gameon.auth.dummy;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/DummyAuth")
public class DummyAuth extends HttpServlet {
	private static final long serialVersionUID = 1L;

    public DummyAuth() {
    }
    
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		String s = request.getParameter("dummyUserName");
		
		if(s==null){
			s="AnonymousUser";
		}

        //redirect the user to facebook to be authenticated.
        response.sendRedirect(request.getContextPath() + "/#/login/callback/DUMMY::"+s);
	}


}
