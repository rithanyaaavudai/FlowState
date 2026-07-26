package com.flowstate.service;

import com.flowstate.dto.DistractionBreakdownResponseDto;
import com.flowstate.dto.DistractionLogRequestDto;
import com.flowstate.dto.DistractionLogResponseDto;
import com.flowstate.entity.DistractionLog;
import com.flowstate.entity.FocusSession;
import com.flowstate.exception.BusinessValidationException;
import com.flowstate.exception.ResourceNotFoundException;
import com.flowstate.repository.DistractionLogRepository;
import com.flowstate.repository.FocusSessionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
