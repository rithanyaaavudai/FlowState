package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

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