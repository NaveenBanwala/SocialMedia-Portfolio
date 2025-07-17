package com.social_portfolio_db.demo.naveen.Controllers.SecurityController;

import com.social_portfolio_db.demo.naveen.Entity.Role;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import com.social_portfolio_db.demo.naveen.Enum.RoleName;
import com.social_portfolio_db.demo.naveen.Jpa.UserJpa;
import com.social_portfolio_db.demo.naveen.Jpa.RoleRepository;
import com.social_portfolio_db.demo.naveen.Payloads.JwtAuthRequest;
import com.social_portfolio_db.demo.naveen.Payloads.JwtAuthResponse;
import com.social_portfolio_db.demo.naveen.Security.JwtService;

import lombok.RequiredArgsConstructor;

import java.util.Map;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserJpa userRepo;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepo;

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@RequestBody JwtAuthRequest request) {
        try {
            // Check if user exists first
            if (!userRepo.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.status(401).body(null);
            }

            // 1. Authenticate user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // 2. Generate token
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
            String token = jwtService.generateToken(userDetails);

            // 3. Return token and username
            JwtAuthResponse response = new JwtAuthResponse();
            response.setToken(token);
            response.setUsername(userDetails.getUsername());

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            // Log the actual exception for debugging
            System.err.println("Authentication failed for email: " + request.getEmail());
            System.err.println("Exception: " + e.getMessage());
            return ResponseEntity.status(401).body(null);
        } catch (Exception e) {
            // Log any other exceptions
            System.err.println("Unexpected error during login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody JwtAuthRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        Role defaultRole = roleRepo.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Default role not found"));

        Users user = new Users();
        user.setUsername(request.getUsername() != null ? request.getUsername() : request.getEmail());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Set.of(defaultRole));

        userRepo.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        JwtAuthResponse response = new JwtAuthResponse();
        response.setToken(token);
        response.setUsername(userDetails.getUsername());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> payload, @AuthenticationPrincipal UserDetails userDetails) {
        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");
        String email = userDetails.getUsername();

        if (oldPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        Users user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.status(400).body("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        return ResponseEntity.ok("Password changed successfully");
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            var users = userRepo.findAll();
            return ResponseEntity.ok(users.stream()
                .map(user -> Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "username", user.getUsername(),
                    "hasPassword", user.getPassword() != null && !user.getPassword().isEmpty()
                ))
                .collect(java.util.stream.Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching users: " + e.getMessage());
        }
    }

    @GetMapping("/check-user/{email}")
    public ResponseEntity<?> checkUserExists(@PathVariable String email) {
        try {
            var user = userRepo.findByEmail(email);
            if (user.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "email", user.get().getEmail(),
                    "username", user.get().getUsername(),
                    "hasPassword", user.get().getPassword() != null && !user.get().getPassword().isEmpty()
                ));
            } else {
                return ResponseEntity.ok(Map.of("exists", false));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error checking user: " + e.getMessage());
        }
    }
}

