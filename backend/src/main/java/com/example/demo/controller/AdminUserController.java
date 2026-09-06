package com.example.demo.controller;

import com.example.demo.dto.UserCreateRequestDto;
import com.example.demo.dto.UserResponseDto;
import com.example.demo.dto.UserRoleUpdateRequestDto;
import com.example.demo.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class AdminUserController {

    private final UserService userService;

    private Long getAuthenticatedUserId(HttpServletRequest request) {
        if (request != null) {
            Object attribute = request.getAttribute("authenticatedUserId");
            if (attribute instanceof Long) {
                return (Long) attribute;
            }
            if (attribute instanceof Integer) {
                return ((Integer) attribute).longValue();
            }
            if (attribute != null) {
                try {
                    return Long.valueOf(attribute.toString());
                } catch (NumberFormatException ignored) {
                }
            }
        }
        return 1L;
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody UserCreateRequestDto dto) {
        UserResponseDto created = userService.createUser(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponseDto> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UserRoleUpdateRequestDto dto,
            HttpServletRequest request) {
        Long requesterId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(userService.updateUserRole(id, dto.getRole(), requesterId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserResponseDto> toggleUserStatus(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long requesterId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(userService.toggleUserStatus(id, requesterId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long requesterId = getAuthenticatedUserId(request);
        userService.deleteUser(id, requesterId);
        return ResponseEntity.noContent().build();
    }
}
