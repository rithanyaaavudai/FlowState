package com.example.demo.service;

import com.example.demo.dto.DistractionBreakdownResponseDto;
import com.example.demo.dto.DistractionLogRequestDto;
import com.example.demo.dto.DistractionLogResponseDto;
import com.example.demo.entity.DistractionLog;
import com.example.demo.entity.FocusSession;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DistractionLogRepository;
import com.example.demo.repository.FocusSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DistractionLogService {

    private final DistractionLogRepository distractionLogRepository;
    private final FocusSessionRepository focusSessionRepository;

    @Transactional
    public DistractionLogResponseDto logDistraction(DistractionLogRequestDto dto, Long practitionerId) {
        FocusSession session = focusSessionRepository.findByIdAndPractitionerId(dto.getSessionId(), practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("FocusSession not found"));

        if (session.getStatus() != FocusSession.SessionStatus.IN_PROGRESS) {
            throw new BusinessValidationException("Distractions can only be logged during an active session");
        }

        DistractionLog log = DistractionLog.builder()
                .session(session)
                .category(DistractionLog.DistractionCategory.valueOf(dto.getCategory()))
                .description(dto.getDescription())
                .durationSeconds(dto.getDurationSeconds())
                .build();

        return toResponseDto(distractionLogRepository.save(log));
    }

    public List<DistractionLogResponseDto> getLogsForSession(Long sessionId) {
        return distractionLogRepository.findBySessionIdOrderByLoggedAtDesc(sessionId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public DistractionBreakdownResponseDto getDistractionBreakdown(Long practitionerId) {
        List<Object[]> rows = distractionLogRepository.findDistractionBreakdownByPractitioner(practitionerId);

        Map<String, Long> countByCategory = new HashMap<>();
        Map<String, Long> durationByCategory = new HashMap<>();

        for (Object[] row : rows) {
            String category = String.valueOf(row[0]);
            countByCategory.put(category, (Long) row[1]);
            durationByCategory.put(category, (Long) row[2]);
        }

        return DistractionBreakdownResponseDto.builder()
                .countByCategory(countByCategory)
                .durationSecondsByCategory(durationByCategory)
                .build();
    }

    public List<Map<String, Object>> getDistractionTrendByWeek(Long practitionerId) {
        List<Object[]> rows = distractionLogRepository.findWeeklyDistractionTrend(practitionerId);
        return rows.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("week", row[0]);
            map.put("count", row[1]);
            return map;
        }).collect(Collectors.toList());
    }

    public Page<DistractionLogResponseDto> getAllPaginated(Pageable pageable) {
        return distractionLogRepository.findAll(pageable).map(this::toResponseDto);
    }

    private DistractionLogResponseDto toResponseDto(DistractionLog log) {
        return DistractionLogResponseDto.builder()
                .id(log.getId())
                .sessionId(log.getSession().getId())
                .loggedAt(log.getLoggedAt())
                .category(log.getCategory().name())
                .description(log.getDescription())
                .durationSeconds(log.getDurationSeconds())
                .createdAt(log.getCreatedAt())
                .build();
    }
}