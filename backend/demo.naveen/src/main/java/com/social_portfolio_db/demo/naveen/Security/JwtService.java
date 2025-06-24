package com.social_portfolio_db.demo.naveen.Security;


import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;


import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")  // Loaded from .env or application.properties
    private String secretKey;

    @Value("${jwt.expirationMs}")
    private long jwtExpirationMs;

    // 1. Generate Token
public String generateToken(UserDetails userDetails) {
    return Jwts.builder()
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
            .signWith(getSignKey(), SignatureAlgorithm.HS256)
            .compact();
}


    // 2. Get username from token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 3. Validate token
    public boolean validateToken(String token, String userEmail) {
        final String username = extractUsername(token);
        return (username.equals(userEmail) && !isTokenExpired(token));
    }

    // Helper: Check expiration
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Helper: Get expiration
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Helper: Extract claims
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Parse token
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Convert secret key
    private Key getSignKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }
}



