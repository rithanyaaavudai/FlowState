import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStats, fetchMySessions } from '../../store/slices/focusSessionSlice';
import { fetchBreakdown } from '../../store/slices/distractionLogSlice';
import StatCards from './StatCards';
import DomainChart from './DomainChart';
import RecentActivity from './RecentActivity';

const Dashboard = () => {
  const dispatch = useDispatch();

  const { user, fullName, username } = useSelector((state) => state.auth || {});
  const { stats, items: sessions } = useSelector((state) => state.focusSessions || {});
  const { breakdown } = useSelector((state) => state.distractionLogs || {});

  const displayName =
    fullName ||
    user?.fullName ||
    user?.name ||
    username ||
    user?.username ||
    localStorage.getItem('flowstate_full_name') ||
    localStorage.getItem('flowstate_username') ||
    'User';

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchMySessions({ page: 0, size: 5 }));
    dispatch(fetchBreakdown());
  }, [dispatch]);

  const countBySessionType = stats?.countBySessionType || stats?.sessionTypeCounts || {
    DEEP_WORK: Array.isArray(sessions) ? sessions.filter((s) => s.sessionType === 'DEEP_WORK').length : 0,
    CREATIVE: Array.isArray(sessions) ? sessions.filter((s) => s.sessionType === 'CREATIVE').length : 0,
    REVIEW: Array.isArray(sessions) ? sessions.filter((s) => s.sessionType === 'REVIEW').length : 0,
  };

  return (
    <div className="page-container dashboard-page">
      <div className="welcome-header welcome-section welcome-banner" data-testid="welcome-message">
        <h1 className="welcome-title">Hello, {displayName}!</h1>
        <p className="welcome-subtitle">Here is your focus dashboard and recent productivity stats.</p>
      </div>

      <StatCards stats={stats || {}} />

      <div className="dashboard-grid">
        <DomainChart title="Session Types" data={countBySessionType} />
        <DomainChart title="Distraction Breakdown" data={breakdown || {}} />
      </div>

      <RecentActivity sessions={Array.isArray(sessions) ? sessions : []} distractionLogs={[]} />
    </div>
  );
};

export default Dashboard;
