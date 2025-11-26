package com.desktrade.controller;

import com.desktrade.model.User;
import com.desktrade.repository.UserRepository;
import com.desktrade.security.AppUserDetails;
import com.desktrade.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5180", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtils;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }


    //Register
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        System.out.println("DEBUG: Register payload = " + req);

        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        String role = normalizeRole(req.getRole()); 

        User u = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .department(req.getDepartment())   
                .role(role)
                .build();

        User saved = userRepository.saveAndFlush(u);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "email", saved.getEmail(), "role", saved.getRole()));
    }

    private String normalizeRole(String r) {
        if (r == null || r.isBlank()) return "ROLE_EMPLOYEE";
        r = r.trim().toUpperCase();
        return r.startsWith("ROLE_") ? r : "ROLE_" + r;
    }



    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest req) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
            AppUserDetails ud = (AppUserDetails) authentication.getPrincipal();
            String token = jwtUtils.generateToken(ud);
            return ResponseEntity.ok(new AuthResponse(token));
 
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body("Invalid email or password");
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Authentication failed: " + ex.getMessage());
        }
    }


    @Data
    static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;
 
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Department is required")
        private String department;
 
        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
 
        private String role;
    }
 
    @Data
    static class AuthRequest {
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;
 
        @NotBlank(message = "Password is required")
        private String password;
    }
 
    @Data
    static class AuthResponse {
        private final String token;
    }
}
