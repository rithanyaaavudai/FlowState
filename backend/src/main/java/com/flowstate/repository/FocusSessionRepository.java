package com.flowstate.repository;

import com.flowstate.entity.FocusSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FocusSessionRepository extends JpaRepository<FocusSession, Long> {
    Page<FocusSession> findByPractitionerId(Long practitionerId, Pageable pageable);
    List<FocusSession> findByPractitionerIdAndStatus(Long practitionerId, FocusSession.SessionStatus status);
    Optional<FocusSession> findByIdAndPractitionerId(Long id, Long practitionerId);
    long countByStatus(FocusSession.SessionStatus status);

    @Query("SELECT fs FROM FocusSession fs WHERE fs.practitioner.id = :practitionerId " +
           "AND (:status IS NULL OR fs.status = :status) " +
           "AND (:title IS NULL OR LOWER(fs.title) LIKE LOWER(CONCAT('%', :title, '%')))")
    Page<FocusSession> findByPractitionerIdAndStatusAndTitle(
            @Param("practitionerId") Long practitionerId,
            @Param("status") FocusSession.SessionStatus status,
            @Param("title") String title,
            Pageable pageable);

    @Query("SELECT fs FROM FocusSession fs WHERE fs.practitioner.id = :practitionerId " +
           "AND fs.status IN ('SCHEDULED', 'IN_PROGRESS') " +
           "AND fs.plannedStart < :plannedEnd AND fs.plannedEnd > :plannedStart")
    List<FocusSession> findConflictingSessions(
            @Param("practitionerId") Long practitionerId,
            @Param("plannedStart") LocalDateTime plannedStart,
            @Param("plannedEnd") LocalDateTime plannedEnd);

    @Query("SELECT AVG(fs.focusScore) FROM FocusSession fs WHERE fs.practitioner.id = :practitionerId AND fs.status = 'COMPLETED'")
    Double findAverageFocusScore(@Param("practitionerId") Long practitionerId);

    @Query("SELECT COALESCE(SUM(fs.focusScore), 0) FROM FocusSession fs WHERE fs.practitioner.id = :practitionerId")
    Long findTotalFocusMinutes(@Param("practitionerId") Long practitionerId);

    @Query("SELECT fs.sessionType, COUNT(fs) FROM FocusSession fs WHERE fs.practitioner.id = :practitionerId GROUP BY fs.sessionType")
    List<Object[]> countBySessionType(@Param("practitionerId") Long practitionerId);

    @Query("SELECT fs FROM FocusSession fs WHERE fs.practitioner.id = :practitionerId ORDER BY fs.createdAt DESC")
    Page<FocusSession> findRecentSessions(@Param("practitionerId") Long practitionerId, Pageable pageable);

    @Query("SELECT fs FROM FocusSession fs WHERE " +
           "(:status IS NULL OR fs.status = :status) " +
           "AND (:title IS NULL OR LOWER(fs.title) LIKE LOWER(CONCAT('%', :title, '%')))")
    Page<FocusSession> findAllWithStatusAndTitleFilter(
            @Param("status") FocusSession.SessionStatus status,
            @Param("title") String title,
            Pageable pageable);
}
