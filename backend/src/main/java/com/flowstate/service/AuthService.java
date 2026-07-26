package com.flowstate.service;

import com.flowstate.dto.AuthRequestDto;
import com.flowstate.dto.AuthResponseDto;
import com.flowstate.dto.RegisterDto;
import com.flowstate.entity.FlowUser;
import com.flowstate.exception.BusinessValidationException;
import com.flowstate.exception.ResourceNotFoundException;
import com.flowstate.repository.FlowUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final FlowUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(FlowUserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponseDto register(RegisterDto dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new BusinessValidationException("Username already exists.");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessValidationException("Email already exists.");
        }

        FlowUser.UserRole role;
        try {
            role = FlowUser.UserRole.valueOf(dto.getRole());
        } catch (IllegalArgumentException e) {
            throw new BusinessValidationException("Invalid role: " + dto.getRole());
        }

        FlowUser user = new FlowUser();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRole(role);
        user.setFullName(dto.getFullName());
        user.setIsActive(true);
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user.getUsername(), user.getRole().name(), user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername(), user.getRole().name(), user.getId());

        return new AuthResponseDto(accessToken, refreshToken, user.getUsername(), user.getRole().name(), user.getId(), user.getFullName());
    }

    public AuthResponseDto login(AuthRequestDto dto) {
        FlowUser user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid username or password."));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new BusinessValidationException("Invalid username or password.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user.getUsername(), user.getRole().name(), user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername(), user.getRole().name(), user.getId());

        return new AuthResponseDto(accessToken, refreshToken, user.getUsername(), user.getRole().name(), user.getId(), user.getFullName());
    }

    public AuthResponseDto refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        FlowUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (!jwtService.isTokenValid(refreshToken, username)) {
            throw new BusinessValidationException("Invalid or expired refresh token.");
        }

        String newAccessToken = jwtService.generateAccessToken(user.getUsername(), user.getRole().name(), user.getId());
        String newRefreshToken = jwtService.generateRefreshToken(user.getUsername(), user.getRole().name(), user.getId());

        return new AuthResponseDto(newAccessToken, newRefreshToken, user.getUsername(), user.getRole().name(), user.getId(), user.getFullName());
    }
}
