package com.social_portfolio_db.demo.naveen.Payloads;

public class JwtAuthRequest {
    private String email;
    private String username;
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}