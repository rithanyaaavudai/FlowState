import React from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';

const StatCards = ({ stats = {} }) => {
  const { user, fullName } = useSelector((state) => state.auth);

  const role = user?.role || localStorage.getItem('flowstate_role') || '';
  const isPractitioner = role === 'PRACTITIONER';
  const nameToDisplay =
    fullName ||
    user?.fullName ||
    user?.username ||
    localStorage.getItem('flowstate_full_name') ||
    'Practitioner';

  const totalSessions = stats?.totalSessions ?? stats?.sessionCount ?? 0;
  const totalFocusHours = stats?.totalFocusHours ?? stats?.focusHours ?? 0;
  const rawScore = stats?.averageFocusScore ?? stats?.avgScore ?? 0;
  const formattedScore = typeof rawScore === 'number' ? `${Math.round(rawScore)}%` : `${rawScore}%`;

  return (
    <div className="dashboard-stats-wrapper">
      {isPractitioner && (
        <div className="practitioner-greeting">
          <h2>Hello, {nameToDisplay}!</h2>
        </div>
      )}

      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-label">Total Sessions</div>
          <div className="stat-value">{totalSessions}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Focus Hours</div>
          <div className="stat-value">{totalFocusHours}h</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Average Focus Score</div>
          <div className="stat-value">{formattedScore}</div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
