import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStats, fetchMySessions } from '../../store/slices/focusSessionSlice';
import { fetchBreakdown } from '../../store/slices/distractionLogSlice';
import StatCards from './StatCards';
import DomainChart from './DomainChart';
import RecentActivity from './RecentActivity';

const Dashboard = () => {
  const dispatch = useDispatch();

  const { stats, items: sessions } = useSelector((state) => state.focusSessions);
  const { breakdown } = useSelector((state) => state.distractionLogs);

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchMySessions({ page: 0, size: 5 }));
    dispatch(fetchBreakdown());
  }, [dispatch]);

  const countBySessionType = stats?.countBySessionType || stats?.sessionTypeCounts || {
    DEEP_WORK: sessions.filter((s) => s.sessionType === 'DEEP_WORK').length,
    CREATIVE: sessions.filter((s) => s.sessionType === 'CREATIVE').length,
    REVIEW: sessions.filter((s) => s.sessionType === 'REVIEW').length,
  };

  return (
    <div className="page-container dashboard-page">
      <StatCards stats={stats || {}} />

      <div className="dashboard-grid">
        <DomainChart title="Session Types" data={countBySessionType} />
        <DomainChart title="Distraction Breakdown" data={breakdown || {}} />
      </div>

      <RecentActivity sessions={sessions} distractionLogs={[]} />
    </div>
  );
};

export default Dashboard;
