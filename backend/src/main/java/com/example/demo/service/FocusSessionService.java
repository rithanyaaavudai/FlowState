package com.example.demo.service;

import com.example.demo.dto.FocusSessionRequestDto;
import com.example.demo.dto.FocusSessionResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class FocusSessionService {

    public Page<FocusSessionResponseDto> getAllSessionsPaginated(
            String search, String status, int page, int size) {
        return new PageImpl<>(Collections.emptyList());
    }

    public FocusSessionResponseDto scheduleSession(
            FocusSessionRequestDto dto, Long userId) {
        return new FocusSessionResponseDto(1L, dto.getTitle(), "SCHEDULED", userId);
    }

    public FocusSessionResponseDto startSession(Long id, Long userId) {
        return new FocusSessionResponseDto(id, "Sample Session", "STARTED", userId);
    }

    public FocusSessionResponseDto getSessionDetails(Long id, Long userId) {
        return new FocusSessionResponseDto(id, "Sample Session", "SCHEDULED", userId);
    }

    public void deleteSession(Long id, Long userId) {
        // delete logic later
    }
}