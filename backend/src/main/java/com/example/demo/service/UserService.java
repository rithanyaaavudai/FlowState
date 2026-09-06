package com.example.demo.service;

import com.example.demo.dto.UserCreateRequestDto;
import com.example.demo.dto.UserResponseDto;
import com.example.demo.entity.FlowUser;
import com.example.demo.entity.CoachRecommendation;
import com.example.demo.entity.FocusBlock;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CoachRecommendationRepository;
import com.example.demo.repository.FlowUserRepository;
import com.example.demo.repository.FocusBlockRepository;
import com.example.demo.repository.FocusSessionRepository;
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
    private final FocusSessionRepository focusSessionRepository;
    private final FocusBlockRepository focusBlockRepository;
    private final CoachRecommendationRepository coachRecommendationRepository;
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

        if (user.getId().equals(requesterId) && newRole != FlowUser.UserRole.PLATFORM_ADMIN) {
            throw new BusinessValidationException("You cannot change your own administrative role");
        }

        if (user.getRole() == FlowUser.UserRole.PLATFORM_ADMIN && newRole != FlowUser.UserRole.PLATFORM_ADMIN) {
            if (Boolean.TRUE.equals(user.getIsActive()) && flowUserRepository.countActiveByRole(FlowUser.UserRole.PLATFORM_ADMIN) <= 1) {
                throw new BusinessValidationException("Cannot demote the last active Platform Administrator");
            }
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

        boolean willBeActive = !Boolean.TRUE.equals(user.getIsActive());
        if (!willBeActive && user.getRole() == FlowUser.UserRole.PLATFORM_ADMIN) {
            if (flowUserRepository.countActiveByRole(FlowUser.UserRole.PLATFORM_ADMIN) <= 1) {
                throw new BusinessValidationException("Cannot deactivate the last active Platform Administrator");
            }
        }

        user.setIsActive(willBeActive);
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

        if (user.getRole() == FlowUser.UserRole.PLATFORM_ADMIN && Boolean.TRUE.equals(user.getIsActive())) {
            if (flowUserRepository.countActiveByRole(FlowUser.UserRole.PLATFORM_ADMIN) <= 1) {
                throw new BusinessValidationException("Cannot delete the last active Platform Administrator");
            }
        }

        long sessionCount = focusSessionRepository.countByPractitionerId(id);
        if (sessionCount > 0) {
            throw new BusinessValidationException(
                    "User cannot be permanently deleted because " + sessionCount +
                    " associated focus session(s) must be retained for telemetry and audit records. Please deactivate the account instead."
            );
        }

        // Cleanly delete dependent focus blocks and coach recommendations
        List<FocusBlock> blocks = focusBlockRepository.findByPractitionerId(id);
        if (!blocks.isEmpty()) {
            focusBlockRepository.deleteAll(blocks);
        }

        List<CoachRecommendation> recsAsPractitioner = coachRecommendationRepository.findByPractitionerId(id);
        if (!recsAsPractitioner.isEmpty()) {
            coachRecommendationRepository.deleteAll(recsAsPractitioner);
        }

        List<CoachRecommendation> recsAsCoach = coachRecommendationRepository.findByCoachId(id);
        if (!recsAsCoach.isEmpty()) {
            coachRecommendationRepository.deleteAll(recsAsCoach);
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
