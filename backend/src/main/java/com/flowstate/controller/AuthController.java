package com.flowstate.controller;

import com.flowstate.dto.AuthRequestDto;
import com.flowstate.dto.AuthResponseDto;
import com.flowstate.dto.RefreshTokenRequestDto;
import com.flowstate.dto.RegisterDto;
import com.flowstate.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterDto dto) {
        AuthResponseDto response = authService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody AuthRequestDto dto) {
        AuthResponseDto response = authService.login(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refresh(@Valid @RequestBody RefreshTokenRequestDto dto) {
        if (dto.getRefreshToken() == null || dto.getRefreshToken().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        AuthResponseDto response = authService.refreshToken(dto.getRefreshToken());
        return ResponseEntity.ok(response);
    }
}
