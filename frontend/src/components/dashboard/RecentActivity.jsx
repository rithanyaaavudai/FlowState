import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const RecentActivity = ({ sessions = [], distractionLogs = [] }) => {
  const combinedActivity = [
    ...sessions.map((s) => ({
      id: `session-${s.id || s.sessionId}`,
      type: 'SESSION',
      title: s.title,
      timestamp: s.createdAt || s.plannedStart || s.updatedAt || new Date().toISOString(),
      status: s.status,
      details: `${s.sessionType ? s.sessionType.replace('_', ' ') : 'Session'} (${s.status || 'SCHEDULED'})`,
    })),
    ...distractionLogs.map((d) => ({
      id: `distraction-${d.id}`,
      type: 'DISTRACTION',
      title: d.description || d.category || 'Distraction Logged',
      timestamp: d.timestamp || d.createdAt || new Date().toISOString(),
      status: 'LOGGED',
      details: `Category: ${d.category || 'General'} | Duration: ${d.durationMinutes || d.duration || 0}m`,
    })),
  ];

  combinedActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const recentItems = combinedActivity.slice(0, 10);

  return (
    <div className="recent-activity-card">
      <h3>Recent Activity</h3>

      {recentItems.length === 0 ? (
        <p className="no-activity">No recent activity found</p>
      ) : (
        <ul className="activity-list">
          {recentItems.map((item) => (
            <li key={item.id} className={`activity-item activity-${item.type.toLowerCase()}`}>
              <div className="activity-icon">
                {item.type === 'SESSION' ? <Clock size={20} color="var(--accent-cyan)" /> : <AlertTriangle size={20} color="var(--warning-border)" />}
              </div>
              <div className="activity-details">
                <div className="activity-title">{item.title}</div>
                <div className="activity-subtitle">{item.details}</div>
              </div>
              <div className="activity-time">
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;
