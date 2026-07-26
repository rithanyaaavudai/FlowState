package com.flowstate.repository;

import com.flowstate.entity.DistractionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DistractionLogRepository extends JpaRepository<DistractionLog, Long> {
    List<DistractionLog> findBySessionIdOrderByLoggedAtDesc(Long sessionId);
    long countBySessionId(Long sessionId);

    @Query("SELECT dl.category, COUNT(dl), COALESCE(SUM(dl.durationSeconds), 0) FROM DistractionLog dl " +
           "WHERE dl.session.practitioner.id = :practitionerId GROUP BY dl.category")
    List<Object[]> findDistractionBreakdownByPractitioner(@Param("practitionerId") Long practitionerId);

    @Query(value = "SELECT YEARWEEK(dl.logged_at) AS week_key, COUNT(*) AS distraction_count, " +
           "COALESCE(SUM(dl.duration_seconds), 0) AS total_seconds " +
           "FROM distraction_log dl " +
           "JOIN focus_session fs ON dl.session_id = fs.id " +
           "WHERE fs.practitioner_id = :practitionerId " +
           "AND dl.logged_at >= DATE_SUB(CURDATE(), INTERVAL 8 WEEK) " +
           "GROUP BY YEARWEEK(dl.logged_at) " +
           "ORDER BY week_key DESC", nativeQuery = true)
    List<Object[]> findWeeklyDistractionTrend(@Param("practitionerId") Long practitionerId);

    @Query("SELECT COALESCE(SUM(dl.durationSeconds), 0) FROM DistractionLog dl WHERE dl.session.id = :sessionId")
    long sumDurationSecondsBySessionId(@Param("sessionId") Long sessionId);
}
