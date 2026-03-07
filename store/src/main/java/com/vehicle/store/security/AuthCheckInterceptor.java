package com.vehicle.store.security;

import com.vehicle.store.dto.ApiResponse;
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
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
            return true;
        }

        String path = request.getRequestURI();

        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register")) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (isPublicPath(request.getMethod(), path)) {
            if (token != null && jwtUtil.validateToken(token)) {
                populateSecurityContext(token);
            }
            return true;
        }

        if (token == null || !jwtUtil.validateToken(token)) {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return false;
        }

        populateSecurityContext(token);

        if (isAdminPath(request.getMethod(), path) && !"A".equals(jwtUtil.extractUserType(token))) {
            sendErrorResponse(response, HttpServletResponse.SC_FORBIDDEN, "Access Denied: Admin role required");
            return false;
        }

        return true;
    }

    private void populateSecurityContext(String token) {
        Long userId = jwtUtil.extractUserId(token);
        String userType = jwtUtil.extractUserType(token);

        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + userType);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userId, null, Collections.singletonList(authority));

        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private boolean isPublicPath(String method, String path) {
        if (method.equalsIgnoreCase("GET")) {
            if (path.matches("^/api/brands/?.*"))
                return true;
            if (path.matches("^/api/fuel-types/?.*"))
                return true;
            if (path.matches("^/api/vehicles/?.*"))
                return true;
        }
        return false;
    }

    private boolean isAdminPath(String method, String path) {
        // Not strictly necessary here since we use @PreAuthorize, but following
        // instructions closely
        if (method.equalsIgnoreCase("POST") || method.equalsIgnoreCase("PUT") || method.equalsIgnoreCase("DELETE")) {
            if (path.startsWith("/api/brands") || path.startsWith("/api/fuel-types")
                    || path.startsWith("/api/vehicles")) {
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
