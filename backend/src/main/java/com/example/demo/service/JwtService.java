package com.example.demo.service;

import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final String secret = "my-secret-key";

    public String generateToken(String username) {
        return "token-" + username;
    }

    public boolean isTokenValid(String token, String username) {
        return token != null && token.contains(username);
    }

    public String extractUsername(String token) {
        if (token == null) return null;
        return token.replace("token-", "");
    }
}