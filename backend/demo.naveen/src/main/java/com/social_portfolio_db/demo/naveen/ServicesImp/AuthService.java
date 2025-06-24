package com.social_portfolio_db.demo.naveen.ServicesImp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.social_portfolio_db.demo.naveen.Payloads.JwtAuthRequest;
import com.social_portfolio_db.demo.naveen.Entity.Users;
import com.social_portfolio_db.demo.naveen.Jpa.UserJpa;
import com.social_portfolio_db.demo.naveen.Security.JwtService;

@Service
public class AuthService {

    @Autowired
    private UserJpa userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    // 🟢 Register method
    public String register(JwtAuthRequest request) {
        Users user = new Users();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepo.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return jwtService.generateToken(userDetails);
    }

    // 🟢 Login method
    public String login(JwtAuthRequest request) {
        Users user = userRepo.findByEmail(request.getEmail())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return jwtService.generateToken(userDetails);
    }
}



