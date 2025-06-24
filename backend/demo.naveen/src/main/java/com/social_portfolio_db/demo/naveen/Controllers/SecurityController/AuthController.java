package com.social_portfolio_db.demo.naveen.Controllers.SecurityController;

import com.social_portfolio_db.demo.naveen.Entity.Users;
import com.social_portfolio_db.demo.naveen.Jpa.UserJpa;
import com.social_portfolio_db.demo.naveen.Payloads.JwtAuthRequest;
import com.social_portfolio_db.demo.naveen.Payloads.JwtAuthResponse;
import com.social_portfolio_db.demo.naveen.Security.JwtService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserJpa userRepo;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@RequestBody JwtAuthRequest request) {
        try {
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
            throw new RuntimeException("Invalid email or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody JwtAuthRequest request) {
        // 1. Check if user exists
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            System.out.println("Registration failed: Email already exists: " + request.getEmail());
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // 2. Create and save user
        Users user = new Users();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepo.save(user);

        try {
            // 3. Generate token
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtService.generateToken(userDetails);

            // 4. Return token + username
            JwtAuthResponse response = new JwtAuthResponse();
            response.setToken(token);
            response.setUsername(userDetails.getUsername());

            System.out.println("Registration successful for: " + request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/test")
    public ResponseEntity<String> test(@RequestBody JwtAuthRequest request) {
        return ResponseEntity.ok("Received: " + request.getEmail());
    }
}

