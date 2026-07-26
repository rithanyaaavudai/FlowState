package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.dto.FocusBlockRequestDto;
import com.example.demo.dto.FocusBlockResponseDto;
import com.example.demo.entity.FlowUser;
import com.example.demo.entity.FocusBlock;
import com.example.demo.entity.FocusSession;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.FlowUserRepository;
import com.example.demo.repository.FocusBlockRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FocusBlockService {

    private final FocusBlockRepository blockRepository;
    private final FlowUserRepository userRepository;

    public FocusBlockService(FocusBlockRepository blockRepository, FlowUserRepository userRepository) {
        this.blockRepository = blockRepository;
        this.userRepository = userRepository;
    }

    public FocusBlockResponseDto registerBlock(FocusBlockRequestDto dto, Long practitionerId) {
        List<FocusBlock> overlapping = blockRepository.findOverlappingBlocks(
                practitionerId, dto.getDayOfWeek(), dto.getBlockStartTime(), dto.getBlockEndTime());
        if (!overlapping.isEmpty()) {
            throw new BusinessValidationException("Block overlaps with an existing block on the same day.");
        }

        FlowUser practitioner = userRepository.findById(practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        FocusBlock block = new FocusBlock();
        block.setPractitioner(practitioner);
        block.setDayOfWeek(dto.getDayOfWeek());
        block.setBlockStartTime(dto.getBlockStartTime());
        block.setBlockEndTime(dto.getBlockEndTime());
        if (dto.getPreferredSessionType() != null && !dto.getPreferredSessionType().isBlank()) {
            block.setPreferredSessionType(FocusSession.SessionType.valueOf(dto.getPreferredSessionType()));
        }

        return mapToResponseDto(blockRepository.save(block));
    }

    public FocusBlockResponseDto protectBlock(Long blockId, Long practitionerId) {
        FocusBlock block = findBlock(blockId, practitionerId);
        block.setIsProtected(true);
        return mapToResponseDto(blockRepository.save(block));
    }

    public FocusBlockResponseDto unprotectBlock(Long blockId, Long practitionerId) {
        FocusBlock block = findBlock(blockId, practitionerId);
        block.setIsProtected(false);
        return mapToResponseDto(blockRepository.save(block));
    }

    public void deleteBlock(Long blockId, Long practitionerId) {
        FocusBlock block = findBlock(blockId, practitionerId);
        blockRepository.delete(block);
    }

    public void deleteBlockAdmin(Long blockId) {
        FocusBlock block = blockRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("FocusBlock not found."));
        blockRepository.delete(block);
    }

    public List<FocusBlockResponseDto> getMyBlocks(Long practitionerId) {
        return blockRepository.findByPractitionerIdOrderByDayOfWeekAscBlockStartTimeAsc(practitionerId)
                .stream().map(this::mapToResponseDto).collect(Collectors.toList());
    }

    public List<FocusBlockResponseDto> getCapacityPlan(Long practitionerId) {
        return getMyBlocks(practitionerId);
    }

    private FocusBlock findBlock(Long blockId, Long practitionerId) {
        FocusBlock block = blockRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("FocusBlock not found."));
        if (!block.getPractitioner().getId().equals(practitionerId)) {
            throw new ResourceNotFoundException("FocusBlock not found.");
        }
        return block;
    }

    private FocusBlockResponseDto mapToResponseDto(FocusBlock b) {
        FocusBlockResponseDto dto = new FocusBlockResponseDto();
        dto.setId(b.getId());
        dto.setPractitionerId(b.getPractitioner().getId());
        dto.setDayOfWeek(b.getDayOfWeek());
        dto.setBlockStartTime(b.getBlockStartTime());
        dto.setBlockEndTime(b.getBlockEndTime());
        dto.setIsProtected(b.getIsProtected());
        dto.setPreferredSessionType(b.getPreferredSessionType() != null ? b.getPreferredSessionType().name() : null);
        dto.setCreatedAt(b.getCreatedAt());
        return dto;
    }
}
