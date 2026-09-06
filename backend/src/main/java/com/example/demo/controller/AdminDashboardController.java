package com.example.demo.controller;

import com.example.demo.entity.FlowUser;
import com.example.demo.entity.FocusSession;
import com.example.demo.entity.CoachRecommendation;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class AdminDashboardController {

    private final FlowUserRepository flowUserRepository;
    private final FocusSessionRepository focusSessionRepository;
    private final FocusBlockRepository focusBlockRepository;
    private final DistractionLogRepository distractionLogRepository;
    private final SessionGoalRepository sessionGoalRepository;
    private final CoachRecommendationRepository coachRecommendationRepository;

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getPlatformOverview(
            @RequestParam(required = false, defaultValue = "all") String period) {

        Map<String, Object> result = new HashMap<>();

        // User stats
        long totalUsers = flowUserRepository.count();
        long practitionerCount = flowUserRepository.findByRole(FlowUser.UserRole.PRACTITIONER).size();
        long coachCount = flowUserRepository.findByRole(FlowUser.UserRole.FLOW_COACH).size();
        long adminCount = flowUserRepository.findByRole(FlowUser.UserRole.PLATFORM_ADMIN).size();
        long activeUsers = flowUserRepository.findAll().stream().filter(FlowUser::getIsActive).count();

        Map<String, Object> userStats = new HashMap<>();
        userStats.put("totalUsers", totalUsers);
        userStats.put("practitionerCount", practitionerCount);
        userStats.put("coachCount", coachCount);
        userStats.put("adminCount", adminCount);
        userStats.put("activeUsers", activeUsers);
        result.put("users", userStats);

        // Sessions stats
        long totalSessions = focusSessionRepository.count();
        long completedSessions = focusSessionRepository.countByStatus(FocusSession.SessionStatus.COMPLETED);
        long inProgressSessions = focusSessionRepository.countByStatus(FocusSession.SessionStatus.IN_PROGRESS);
        long scheduledSessions = focusSessionRepository.countByStatus(FocusSession.SessionStatus.SCHEDULED);
        long abandonedSessions = focusSessionRepository.countByStatus(FocusSession.SessionStatus.ABANDONED);
        Double avgFocusScore = focusSessionRepository.findPlatformAverageFocusScore();
        Long totalFocusMinutes = focusSessionRepository.findPlatformTotalFocusMinutes();

        Map<String, Object> sessionStats = new HashMap<>();
        sessionStats.put("totalSessions", totalSessions);
        sessionStats.put("completedSessions", completedSessions);
        sessionStats.put("inProgressSessions", inProgressSessions);
        sessionStats.put("scheduledSessions", scheduledSessions);
        sessionStats.put("abandonedSessions", abandonedSessions);
        sessionStats.put("averageFocusScore", avgFocusScore != null ? Math.round(avgFocusScore * 10.0) / 10.0 : 0.0);
        sessionStats.put("totalFocusMinutes", totalFocusMinutes != null ? totalFocusMinutes : 0L);
        sessionStats.put("totalFocusHours", totalFocusMinutes != null ? Math.round((totalFocusMinutes / 60.0) * 10.0) / 10.0 : 0.0);
        result.put("sessions", sessionStats);

        // Session type distribution
        List<Object[]> sessionTypeCounts = focusSessionRepository.countPlatformBySessionType();
        Map<String, Long> sessionTypeMap = new HashMap<>();
        for (Object[] row : sessionTypeCounts) {
            if (row != null && row.length >= 2 && row[0] != null) {
                long c = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
                sessionTypeMap.put(String.valueOf(row[0]), c);
            }
        }
        result.put("sessionTypes", sessionTypeMap);

        // Distractions breakdown
        List<Object[]> distractionBreakdown = distractionLogRepository.findPlatformDistractionBreakdown();
        Map<String, Long> distractionCountMap = new HashMap<>();
        Map<String, Long> distractionDurationMap = new HashMap<>();
        long totalDistractions = 0;
        long totalDistractionSeconds = 0;

        for (Object[] row : distractionBreakdown) {
            if (row != null && row.length >= 3 && row[0] != null) {
                String cat = String.valueOf(row[0]);
                long cnt = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
                long dur = row[2] instanceof Number ? ((Number) row[2]).longValue() : 0L;
                distractionCountMap.put(cat, cnt);
                distractionDurationMap.put(cat, dur);
                totalDistractions += cnt;
                totalDistractionSeconds += dur;
            }
        }

        Map<String, Object> distractionStats = new HashMap<>();
        distractionStats.put("totalCount", totalDistractions);
        distractionStats.put("totalDurationSeconds", totalDistractionSeconds);
        distractionStats.put("countByCategory", distractionCountMap);
        distractionStats.put("durationByCategory", distractionDurationMap);
        result.put("distractions", distractionStats);

        // Focus Blocks stats
        long totalBlocks = focusBlockRepository.count();
        long protectedBlocks = focusBlockRepository.findAll().stream().filter(b -> Boolean.TRUE.equals(b.getIsProtected())).count();
        Map<String, Object> blockStats = new HashMap<>();
        blockStats.put("totalBlocks", totalBlocks);
        blockStats.put("protectedBlocks", protectedBlocks);
        result.put("blocks", blockStats);

        // Recommendations stats
        long totalRecs = coachRecommendationRepository.count();
        long pendingRecs = coachRecommendationRepository.findAll().stream().filter(r -> r.getStatus() == CoachRecommendation.RecommendationStatus.PENDING).count();
        long ackRecs = coachRecommendationRepository.findAll().stream().filter(r -> r.getStatus() == CoachRecommendation.RecommendationStatus.ACKNOWLEDGED).count();
        long dismissedRecs = coachRecommendationRepository.findAll().stream().filter(r -> r.getStatus() == CoachRecommendation.RecommendationStatus.DISMISSED).count();

        Map<String, Object> recStats = new HashMap<>();
        recStats.put("totalRecommendations", totalRecs);
        recStats.put("pendingRecommendations", pendingRecs);
        recStats.put("acknowledgedRecommendations", ackRecs);
        recStats.put("dismissedRecommendations", dismissedRecs);
        result.put("recommendations", recStats);

        return ResponseEntity.ok(result);
    }
}
