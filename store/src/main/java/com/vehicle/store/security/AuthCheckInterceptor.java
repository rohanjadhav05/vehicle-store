package com.vehicle.store.security;

import com.vehicle.store.dto.ApiResponse;
import com.vehicle.store.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Collections;

@Component
public class AuthCheckInterceptor implements HandlerInterceptor {

    @Autowired
    private SessionUtil sessionUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
            return true;
        }

        String path = request.getRequestURI();

        // Skip interceptor for public endpoints
        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register")) {
            return true;
        }
        
        // Let's assume some routes are public. The requirement says to intercept "every request except POST login/register".
        // But the requirement also says "GET /api/brands -> public", "GET /api/fuel-types -> public", etc.
        // So we should allow public access if no session is needed for those routes. 
        // We will populate SecurityContext if session exists, and if a route is @PreAuthorize secured, it will fail if not authenticated.
        // Wait, the prompt specifically says: 
        // "Checks if session has a logged-in user using SessionUtil.isLoggedIn() Returns 401 JSON response if not logged in"
        // But it also says GET /api/brands is public. 
        // So we need to whitelist public paths here.
        if (isPublicPath(request.getMethod(), path)) {
            // Still populate context if they happen to be logged in
            populateSecurityContext(request);
            return true;
        }

        if (!sessionUtil.isLoggedIn(request.getSession(false))) {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return false;
        }
        
        populateSecurityContext(request);

        // Optional: Manual Check for ADMIN only paths
        // We will rely on @PreAuthorize("hasRole('A')") but we can also add a quick check here if needed.
        if (isAdminPath(request.getMethod(), path) && !sessionUtil.isAdmin(request.getSession(false))) {
            sendErrorResponse(response, HttpServletResponse.SC_FORBIDDEN, "Access Denied: Admin role required");
            return false;
        }

        return true;
    }

    private void populateSecurityContext(HttpServletRequest request) {
        if (request.getSession(false) != null && sessionUtil.isLoggedIn(request.getSession(false))) {
            Long userId = sessionUtil.getCurrentUserId(request.getSession(false));
            String userType = sessionUtil.getCurrentUserType(request.getSession(false));
            
            // ROLE_A or ROLE_U
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + userType);
            
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    userId, null, Collections.singletonList(authority));
                    
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
    }

    private boolean isPublicPath(String method, String path) {
        if (method.equalsIgnoreCase("GET")) {
            if (path.matches("^/api/brands/?.*")) return true;
            if (path.matches("^/api/fuel-types/?.*")) return true;
            if (path.matches("^/api/vehicles/?.*")) return true;
        }
        return false;
    }

    private boolean isAdminPath(String method, String path) {
        // Not strictly necessary here since we use @PreAuthorize, but following instructions closely
        if (method.equalsIgnoreCase("POST") || method.equalsIgnoreCase("PUT") || method.equalsIgnoreCase("DELETE")) {
            if (path.startsWith("/api/brands") || path.startsWith("/api/fuel-types") || path.startsWith("/api/vehicles")) {
                if (!path.startsWith("/api/bookmarks") && !path.startsWith("/api/bookings")) {
                    return true;
                }
            }
        }
        if (path.startsWith("/api/bookings/all")) {
            return true;
        }
        if (method.equalsIgnoreCase("PUT") && path.matches("^/api/bookings/.*/status$")) {
            return true;
        }
        return false;
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        ApiResponse<Void> apiResponse = ApiResponse.error(message);
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}
