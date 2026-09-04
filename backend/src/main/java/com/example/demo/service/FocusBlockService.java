package com.example.demo.service;

import com.example.demo.dto.FocusBlockRequestDto;
import com.example.demo.dto.FocusBlockResponseDto;
import com.example.demo.entity.FlowUser;
import com.example.demo.entity.FocusBlock;
import com.example.demo.entity.FocusSession;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.FlowUserRepository;
import com.example.demo.repository.FocusBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FocusBlockService {

    private final FocusBlockRepository focusBlockRepository;
    private final FlowUserRepository flowUserRepository;

    @Transactional
    public FocusBlockResponseDto registerBlock(FocusBlockRequestDto dto, Long practitionerId) {
        FlowUser practitioner = flowUserRepository.findById(practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found"));

        if (!dto.getBlockEndTime().isAfter(dto.getBlockStartTime())) {
            throw new BusinessValidationException("Block end time must be after block start time");
        }

        List<FocusBlock> overlaps = focusBlockRepository.findOverlappingBlocks(
                practitionerId, dto.getDayOfWeek(), dto.getBlockStartTime(), dto.getBlockEndTime());
        if (!overlaps.isEmpty()) {
            throw new BusinessValidationException("Focus block overlaps with an existing block");
        }

        long duration = java.time.Duration.between(dto.getBlockStartTime(), dto.getBlockEndTime()).toMinutes();
        if (duration < 0) {
            duration += 24 * 60;
        }

        FocusBlock block = FocusBlock.builder()
                .practitioner(practitioner)
                .practitionerId(practitioner.getId())
                .dayOfWeek(dto.getDayOfWeek())
                .blockStartTime(dto.getBlockStartTime())
                .blockEndTime(dto.getBlockEndTime())
                .durationMinutes((int) duration)
                .taskName(dto.getPreferredSessionType() != null && !dto.getPreferredSessionType().isBlank()
                        ? dto.getPreferredSessionType()
                        : "Focus Block")
                .isProtected(false)
                .preferredSessionType(dto.getPreferredSessionType() != null && !dto.getPreferredSessionType().isBlank()
                        ? FocusSession.SessionType.valueOf(dto.getPreferredSessionType().trim().toUpperCase())
                        : null)
                .build();

        return toResponseDto(focusBlockRepository.save(block));
    }

    @Transactional
    public FocusBlockResponseDto protectBlock(Long blockId, Long practitionerId) {
        FocusBlock block = getOwnedBlock(blockId, practitionerId);
        block.setIsProtected(true);
        return toResponseDto(focusBlockRepository.save(block));
    }

    @Transactional
    public FocusBlockResponseDto unprotectBlock(Long blockId, Long practitionerId) {
        FocusBlock block = getOwnedBlock(blockId, practitionerId);
        block.setIsProtected(false);
        return toResponseDto(focusBlockRepository.save(block));
    }

    @Transactional
    public void deleteBlock(Long blockId, Long practitionerId) {
        FocusBlock block = getOwnedBlock(blockId, practitionerId);
        focusBlockRepository.delete(block);
    }

    public List<FocusBlockResponseDto> getMyBlocks(Long practitionerId) {
        return focusBlockRepository.findByPractitionerIdOrderByDayOfWeekAscBlockStartTimeAsc(practitionerId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public List<FocusBlockResponseDto> getCapacityPlan(Long practitionerId) {
        return getMyBlocks(practitionerId);
    }

    private FocusBlock getOwnedBlock(Long blockId, Long practitionerId) {
        return focusBlockRepository.findById(blockId)
                .filter(b -> b.getPractitioner().getId().equals(practitionerId))
                .orElseThrow(() -> new ResourceNotFoundException("FocusBlock not found"));
    }

    private FocusBlockResponseDto toResponseDto(FocusBlock block) {
        return FocusBlockResponseDto.builder()
                .id(block.getId())
                .practitionerId(block.getPractitioner().getId())
                .dayOfWeek(block.getDayOfWeek())
                .blockStartTime(block.getBlockStartTime())
                .blockEndTime(block.getBlockEndTime())
                .durationMinutes(block.getDurationMinutes())
                .isProtected(block.getIsProtected())
                .preferredSessionType(block.getPreferredSessionType() != null ? block.getPreferredSessionType().name() : null)
                .createdAt(block.getCreatedAt())
                .build();
    }
}