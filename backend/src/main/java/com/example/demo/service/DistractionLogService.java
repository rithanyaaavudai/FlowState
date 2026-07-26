package com.example.demo.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.dto.DistractionBreakdownResponseDto;
import com.example.demo.dto.DistractionLogRequestDto;
import com.example.demo.dto.DistractionLogResponseDto;
import com.example.demo.entity.DistractionLog;
import com.example.demo.entity.FocusSession;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DistractionLogRepository;
import com.example.demo.repository.FocusSessionRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DistractionLogService {

    private final DistractionLogRepository distractionLogRepository;
    private final FocusSessionRepository sessionRepository;

    public DistractionLogService(DistractionLogRepository distractionLogRepository,
                                  FocusSessionRepository sessionRepository) {
        this.distractionLogRepository = distractionLogRepository;
        this.sessionRepository = sessionRepository;
    }

    public DistractionLogResponseDto logDistraction(DistractionLogRequestDto dto, Long practitionerId) {
        FocusSession session = sessionRepository.findByIdAndPractitionerId(dto.getSessionId(), practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("FocusSession not found."));

        if (session.getStatus() != FocusSession.SessionStatus.IN_PROGRESS) {
            throw new BusinessValidationException("Distractions can only be logged for IN_PROGRESS sessions.");
        }

        DistractionLog log = new DistractionLog();
        log.setSession(session);
        log.setCategory(DistractionLog.DistractionCategory.valueOf(dto.getCategory()));
        log.setDescription(dto.getDescription());
        log.setDurationSeconds(dto.getDurationSeconds());

        DistractionLog saved = distractionLogRepository.save(log);
        return mapToResponseDto(saved);
    }

    public List<DistractionLogResponseDto> getLogsForSession(Long sessionId) {
        return distractionLogRepository.findBySessionIdOrderByLoggedAtDesc(sessionId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public List<DistractionBreakdownResponseDto> getDistractionBreakdown(Long practitionerId) {
        return distractionLogRepository.findDistractionBreakdownByPractitioner(practitionerId).stream()
                .map(row -> new DistractionBreakdownResponseDto(
                        row[0] != null ? row[0].toString() : "UNKNOWN",
                        (Long) row[1],
                        (Long) row[2]
                ))
                .collect(Collectors.toList());
    }

    public List<Object[]> getDistractionTrendByWeek(Long practitionerId) {
        return distractionLogRepository.findWeeklyDistractionTrend(practitionerId);
    }

    public Page<DistractionLogResponseDto> getAllDistractionsPageable(Pageable pageable) {
        return distractionLogRepository.findAll(pageable).map(this::mapToResponseDto);
    }

    private DistractionLogResponseDto mapToResponseDto(DistractionLog dl) {
        DistractionLogResponseDto dto = new DistractionLogResponseDto();
        dto.setId(dl.getId());
        dto.setSessionId(dl.getSession().getId());
        dto.setLoggedAt(dl.getLoggedAt());
        dto.setCategory(dl.getCategory() != null ? dl.getCategory().name() : null);
        dto.setDescription(dl.getDescription());
        dto.setDurationSeconds(dl.getDurationSeconds());
        dto.setCreatedAt(dl.getCreatedAt());
        return dto;
    }
}
