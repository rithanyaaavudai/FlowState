package com.example.demo.service;

import com.example.demo.dto.UserCreateRequestDto;
import com.example.demo.dto.UserResponseDto;
import com.example.demo.entity.FlowUser;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.FlowUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final FlowUserRepository flowUserRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponseDto> getAllUsers() {
        return flowUserRepository.findAll().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public UserResponseDto getUserById(Long id) {
        FlowUser user = flowUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return toResponseDto(user);
    }

    @Transactional
    public UserResponseDto createUser(UserCreateRequestDto dto) {
        if (flowUserRepository.existsByUsername(dto.getUsername())) {
            throw new BusinessValidationException("Username already exists");
        }
        if (flowUserRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessValidationException("Email already exists");
        }

        FlowUser.UserRole role;
        try {
            role = FlowUser.UserRole.valueOf(dto.getRole().toUpperCase());
        } catch (Exception e) {
            throw new BusinessValidationException("Invalid role: " + dto.getRole());
        }

        FlowUser user = FlowUser.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .fullName(dto.getFullName())
                .role(role)
                .isActive(true)
                .build();

        FlowUser saved = flowUserRepository.save(user);
        return toResponseDto(saved);
    }

    @Transactional
    public UserResponseDto updateUserRole(Long id, String roleStr, Long requesterId) {
        FlowUser user = flowUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        FlowUser.UserRole newRole;
        try {
            newRole = FlowUser.UserRole.valueOf(roleStr.toUpperCase());
        } catch (Exception e) {
            throw new BusinessValidationException("Invalid role: " + roleStr);
        }

        user.setRole(newRole);
        FlowUser updated = flowUserRepository.save(user);
        return toResponseDto(updated);
    }

    @Transactional
    public UserResponseDto toggleUserStatus(Long id, Long requesterId) {
        FlowUser user = flowUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (user.getId().equals(requesterId)) {
            throw new BusinessValidationException("You cannot deactivate your own account");
        }

        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        FlowUser updated = flowUserRepository.save(user);
        return toResponseDto(updated);
    }

    @Transactional
    public void deleteUser(Long id, Long requesterId) {
        FlowUser user = flowUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (user.getId().equals(requesterId)) {
            throw new BusinessValidationException("You cannot delete your own account");
        }

        flowUserRepository.delete(user);
    }

    private UserResponseDto toResponseDto(FlowUser user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
