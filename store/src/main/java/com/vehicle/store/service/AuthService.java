package com.vehicle.store.service;

import com.vehicle.store.dto.AuthResponse;
import com.vehicle.store.dto.LoginRequest;
import com.vehicle.store.dto.RegisterRequest;
import com.vehicle.store.entity.User;
import com.vehicle.store.enums.UserType;
import com.vehicle.store.exception.AccessDeniedException;
import com.vehicle.store.exception.DuplicateResourceException;
import com.vehicle.store.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.vehicle.store.util.SessionUtil sessionUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already in use");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .userType(UserType.U) // Default user type
                .build();

        user = userRepository.save(user);

        return AuthResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .userType(user.getUserType().name())
                .build();
    }

    public AuthResponse login(LoginRequest request, HttpSession session) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AccessDeniedException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AccessDeniedException("Invalid username or password");
        }

        sessionUtil.setSession(session, user);

        return AuthResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .userType(user.getUserType().name())
                .build();
    }
}
