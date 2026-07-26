package com.example.demo.service;

import com.example.demo.dto.AuthRequestDto;
import com.example.demo.dto.AuthResponseDto;
import com.example.demo.dto.RegisterDto;
import com.example.demo.entity.FlowUser;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.FlowUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final FlowUserRepository flowUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponseDto register(RegisterDto dto) {
        if (flowUserRepository.existsByUsername(dto.getUsername())) {
            throw new BusinessValidationException("Username already exists");
        }
        if (flowUserRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessValidationException("Email already exists");
        }

        FlowUser user = FlowUser.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .fullName(dto.getFullName())
                .role(FlowUser.UserRole.valueOf(dto.getRole()))
                .isActive(true)
                .build();

        FlowUser saved = flowUserRepository.save(user);
        return buildAuthResponse(saved);
    }

    @Transactional
    public AuthResponseDto login(AuthRequestDto dto) {
        FlowUser user = flowUserRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        user.setLastLoginAt(LocalDateTime.now());
        flowUserRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponseDto refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BusinessValidationException("Refresh token is required");
        }

        String username = jwtService.extractUsername(refreshToken);
        if (!jwtService.isTokenValid(refreshToken, username)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        FlowUser user = flowUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return buildAuthResponse(user);
    }

    private AuthResponseDto buildAuthResponse(FlowUser user) {
        String accessToken = jwtService.generateAccessToken(user.getUsername(), user.getRole().name(), user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername(), user.getRole().name(), user.getId());

        return AuthResponseDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}