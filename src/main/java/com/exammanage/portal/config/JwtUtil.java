package com.exammanage.portal.config;

import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    // Generate dummy token
    public String generateToken(String email) {
        return "dummy-jwt-token";
    }

    // Extract email from token
    public String extractEmail(String token) {
        return "demo@gmail.com";
    }

    // Validate token
    public boolean validateToken(String token) {
        return token != null && !token.isEmpty();
    }
}