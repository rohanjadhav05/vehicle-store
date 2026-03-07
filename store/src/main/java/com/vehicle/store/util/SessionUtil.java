package com.vehicle.store.util;

import com.vehicle.store.entity.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;

@Component
public class SessionUtil {

    private static final String USER_ID_KEY = "USER_ID";
    private static final String USER_NAME_KEY = "USER_NAME";
    private static final String USER_TYPE_KEY = "USER_TYPE";

    public void setSession(HttpSession session, User user) {
        session.setAttribute(USER_ID_KEY, user.getId());
        session.setAttribute(USER_NAME_KEY, user.getUsername());
        session.setAttribute(USER_TYPE_KEY, user.getUserType().name());
    }

    public Long getCurrentUserId(HttpSession session) {
        if (session == null) return null;
        Object userId = session.getAttribute(USER_ID_KEY);
        return userId != null ? (Long) userId : null;
    }

    public String getCurrentUserType(HttpSession session) {
        if (session == null) return null;
        Object userType = session.getAttribute(USER_TYPE_KEY);
        return userType != null ? (String) userType : null;
    }

    public boolean isLoggedIn(HttpSession session) {
        return session != null && session.getAttribute(USER_ID_KEY) != null;
    }

    public boolean isAdmin(HttpSession session) {
        if (session == null) return false;
        String userType = getCurrentUserType(session);
        return "A".equals(userType);
    }

    public void invalidateSession(HttpSession session) {
        if (session != null) {
            session.invalidate();
        }
    }
}
