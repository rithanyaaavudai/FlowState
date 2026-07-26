package com.flowstate.repository;

import com.flowstate.entity.SessionGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SessionGoalRepository extends JpaRepository<SessionGoal, Long> {
    List<SessionGoal> findBySessionId(Long sessionId);
    List<SessionGoal> findBySessionIdAndStatus(Long sessionId, SessionGoal.GoalStatus status);

    @Query("SELECT COUNT(sg) FROM SessionGoal sg WHERE sg.session.practitioner.id = :practitionerId AND sg.status = 'ACHIEVED'")
    long countAchievedGoalsByPractitioner(@Param("practitionerId") Long practitionerId);

    @Query("SELECT COUNT(sg) FROM SessionGoal sg WHERE sg.session.practitioner.id = :practitionerId AND sg.status <> 'PENDING'")
    long countResolvedGoalsByPractitioner(@Param("practitionerId") Long practitionerId);

    @Query("SELECT sg.status, COUNT(sg) FROM SessionGoal sg WHERE sg.session.practitioner.id = :practitionerId GROUP BY sg.status")
    List<Object[]> countGoalsByStatusForPractitioner(@Param("practitionerId") Long practitionerId);
}
