package com.vehicle.store.controller;

import com.vehicle.store.dto.ApiResponse;
import com.vehicle.store.dto.AuthResponse;
import com.vehicle.store.dto.LoginRequest;
import com.vehicle.store.dto.RegisterRequest;
import com.vehicle.store.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, login, and logout")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Logs in a user and creates a session")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Invalidates the current user session")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}
