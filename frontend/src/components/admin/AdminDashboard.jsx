import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('all');
  const [overview, setOverview] = useState({
    users: { totalUsers: 0, practitionerCount: 0, coachCount: 0, adminCount: 0, activeUsers: 0 },
    sessions: { totalSessions: 0, completedSessions: 0, inProgressSessions: 0, scheduledSessions: 0, abandonedSessions: 0, averageFocusScore: 0, totalFocusHours: 0 },
    sessionTypes: {},
    distractions: { totalCount: 0, totalDurationSeconds: 0, countByCategory: {}, durationByCategory: {} },
    blocks: { totalBlocks: 0, protectedBlocks: 0 },
    recommendations: { totalRecommendations: 0, pendingRecommendations: 0, acknowledgedRecommendations: 0, dismissedRecommendations: 0 },
  });

  const fetchOverviewData = async (selectedPeriod) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getOverview(selectedPeriod);
      setOverview(data);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
      setError(err.response?.data?.message || 'Failed to load platform overview metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData(period);
  }, [period]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const sessions = overview.sessions || {};
  const users = overview.users || {};
  const distractions = overview.distractions || {};
  const blocks = overview.blocks || {};
  const recommendations = overview.recommendations || {};
  const sessionTypes = overview.sessionTypes || {};

  const completionRate = sessions.totalSessions > 0
    ? Math.round((sessions.completedSessions / sessions.totalSessions) * 100)
    : 0;

  const abandonmentRate = sessions.totalSessions > 0
    ? Math.round((sessions.abandonedSessions / sessions.totalSessions) * 100)
    : 0;

  return (
    <AdminLayout>
      <div className="admin-page">
        {/* Controls Bar */}
        <div className="admin-section-header">
          <div>
            <h2 className="admin-page-title">Executive Platform Overview</h2>
            <p className="admin-page-description">
              Real-time aggregated telemetry across all practitioners, coaches, and focus sessions.
            </p>
          </div>

          <div className="admin-filter-group">
            <span className="filter-label">Timeframe:</span>
            <div className="btn-group-segmented">
              <button
                type="button"
                className={`btn-segment ${period === 'today' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('today')}
              >
                Today
              </button>
              <button
                type="button"
                className={`btn-segment ${period === '7d' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('7d')}
              >
                7 Days
              </button>
              <button
                type="button"
                className={`btn-segment ${period === '30d' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('30d')}
              >
                30 Days
              </button>
              <button
                type="button"
                className={`btn-segment ${period === 'all' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('all')}
              >
                All Time
              </button>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fetchOverviewData(period)}
              title="Refresh Data"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            <strong>System Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="admin-loading-state">
            <div className="spinner"></div>
            <p>Aggregating platform metrics from database...</p>
          </div>
        ) : (
          <>
            {/* 6 Primary KPI Cards */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card card-cyan">
                <div className="kpi-header">
                  <span className="kpi-title">Total Focus Sessions</span>
                  <span className="kpi-icon">🎯</span>
                </div>
                <div className="kpi-value">{sessions.totalSessions || 0}</div>
                <div className="kpi-footer">
                  <span className="kpi-badge badge-neutral">Platform-wide</span>
                  <span className="kpi-subtext">{sessions.scheduledSessions || 0} scheduled</span>
                </div>
              </div>

              <div className="admin-kpi-card card-green">
                <div className="kpi-header">
                  <span className="kpi-title">Completed Sessions</span>
                  <span className="kpi-icon">✅</span>
                </div>
                <div className="kpi-value">{sessions.completedSessions || 0}</div>
                <div className="kpi-footer">
                  <span className="kpi-badge badge-success">{completionRate}% rate</span>
                  <span className="kpi-subtext">Successfully finished</span>
                </div>
              </div>

              <div className="admin-kpi-card card-purple">
                <div className="kpi-header">
                  <span className="kpi-title">In-Progress Sessions</span>
                  <span className="kpi-icon">⚡</span>
                </div>
                <div className="kpi-value">{sessions.inProgressSessions || 0}</div>
                <div className="kpi-footer">
                  <span className="kpi-badge badge-info">Active Now</span>
                  <span className="kpi-subtext">Live focus timers</span>
                </div>
              </div>

              <div className="admin-kpi-card card-amber">
                <div className="kpi-header">
                  <span className="kpi-title">Abandoned Sessions</span>
                  <span className="kpi-icon">⚠️</span>
                </div>
                <div className="kpi-value">{sessions.abandonedSessions || 0}</div>
                <div className="kpi-footer">
                  <span className="kpi-badge badge-warning">{abandonmentRate}% rate</span>
                  <span className="kpi-subtext">Prematurely exited</span>
                </div>
              </div>

              <div className="admin-kpi-card card-blue">
                <div className="kpi-header">
                  <span className="kpi-title">Average Focus Score</span>
                  <span className="kpi-icon">📈</span>
                </div>
                <div className="kpi-value">{sessions.averageFocusScore || 0}<span className="kpi-unit">/100</span></div>
                <div className="kpi-footer">
                  <span className="kpi-badge badge-primary">Weighted score</span>
                  <span className="kpi-subtext">Across completed</span>
                </div>
              </div>

              <div className="admin-kpi-card card-indigo">
                <div className="kpi-header">
                  <span className="kpi-title">Total Focus Time</span>
                  <span className="kpi-icon">⏳</span>
                </div>
                <div className="kpi-value">{sessions.totalFocusHours || 0}<span className="kpi-unit"> hrs</span></div>
                <div className="kpi-footer">
                  <span className="kpi-badge badge-secondary">{sessions.totalFocusMinutes || 0} mins</span>
                  <span className="kpi-subtext">Pure productive time</span>
                </div>
              </div>
            </div>

            {/* Middle Grid: Users Governance & Session Types */}
            <div className="admin-two-column-grid">
              {/* User Demographics & Roles */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">👥 User Population & Roles</h3>
                  <Link to="/admin/users" className="admin-card-link">Manage Users →</Link>
                </div>
                <div className="admin-card-body">
                  <div className="admin-user-summary-grid">
                    <div className="user-stat-box">
                      <span className="user-stat-label">Total Accounts</span>
                      <span className="user-stat-number">{users.totalUsers || 0}</span>
                      <span className="user-stat-hint">{users.activeUsers || 0} Active</span>
                    </div>
                    <div className="user-stat-box">
                      <span className="user-stat-label">Practitioners</span>
                      <span className="user-stat-number stat-cyan">{users.practitionerCount || 0}</span>
                      <span className="user-stat-hint">Focus session users</span>
                    </div>
                    <div className="user-stat-box">
                      <span className="user-stat-label">Flow Coaches</span>
                      <span className="user-stat-number stat-purple">{users.coachCount || 0}</span>
                      <span className="user-stat-hint">Performance mentors</span>
                    </div>
                    <div className="user-stat-box">
                      <span className="user-stat-label">Platform Admins</span>
                      <span className="user-stat-number stat-gold">{users.adminCount || 0}</span>
                      <span className="user-stat-hint">Super administrators</span>
                    </div>
                  </div>

                  <div className="progress-bar-container">
                    <div className="progress-bar-label">
                      <span>User Role Composition</span>
                    </div>
                    <div className="multi-progress-bar">
                      <div
                        className="bar-segment bar-cyan"
                        style={{
                          width: `${users.totalUsers ? (users.practitionerCount / users.totalUsers) * 100 : 0}%`,
                        }}
                        title={`Practitioners: ${users.practitionerCount}`}
                      />
                      <div
                        className="bar-segment bar-purple"
                        style={{
                          width: `${users.totalUsers ? (users.coachCount / users.totalUsers) * 100 : 0}%`,
                        }}
                        title={`Coaches: ${users.coachCount}`}
                      />
                      <div
                        className="bar-segment bar-gold"
                        style={{
                          width: `${users.totalUsers ? (users.adminCount / users.totalUsers) * 100 : 0}%`,
                        }}
                        title={`Admins: ${users.adminCount}`}
                      />
                    </div>
                    <div className="progress-legend">
                      <span className="legend-item"><span className="legend-dot dot-cyan"></span> Practitioner ({users.practitionerCount})</span>
                      <span className="legend-item"><span className="legend-dot dot-purple"></span> Coach ({users.coachCount})</span>
                      <span className="legend-item"><span className="legend-dot dot-gold"></span> Admin ({users.adminCount})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Types Distribution */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">📊 Session Modality Distribution</h3>
                  <Link to="/admin/sessions" className="admin-card-link">All Sessions →</Link>
                </div>
                <div className="admin-card-body">
                  {Object.keys(sessionTypes).length === 0 ? (
                    <div className="admin-empty-subtext">No session modality data available yet.</div>
                  ) : (
                    <div className="session-types-list">
                      {Object.entries(sessionTypes).map(([type, count]) => {
                        const total = sessions.totalSessions || 1;
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={type} className="session-type-row">
                            <div className="type-meta">
                              <span className="type-name">{type.replace('_', ' ')}</span>
                              <span className="type-count">{count} sessions ({pct}%)</span>
                            </div>
                            <div className="type-bar-track">
                              <div className="type-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Grid: Distractions, Focus Blocks, Coach Recommendations */}
            <div className="admin-three-column-grid">
              {/* Distraction Insights */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">⚡ Distraction Impact</h3>
                  <Link to="/admin/distractions" className="admin-card-link">View Details →</Link>
                </div>
                <div className="admin-card-body">
                  <div className="stat-highlight">
                    <div className="stat-highlight-val">{distractions.totalCount || 0}</div>
                    <div className="stat-highlight-desc">Total Distraction Events Recorded</div>
                  </div>
                  <div className="stat-highlight-sub">
                    Time lost: <strong>{Math.round((distractions.totalDurationSeconds || 0) / 60)} minutes</strong>
                  </div>
                  <div className="category-tag-list">
                    {distractions.countByCategory &&
                      Object.entries(distractions.countByCategory).map(([cat, cnt]) => (
                        <span key={cat} className="category-tag">
                          {cat}: <strong>{cnt}</strong>
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              {/* Focus Blocks */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">🛡️ Focus Blocks</h3>
                  <Link to="/admin/focus-blocks" className="admin-card-link">Manage Blocks →</Link>
                </div>
                <div className="admin-card-body">
                  <div className="stat-highlight">
                    <div className="stat-highlight-val">{blocks.totalBlocks || 0}</div>
                    <div className="stat-highlight-desc">Active Recurring Blocks</div>
                  </div>
                  <div className="stat-highlight-sub">
                    Protected blocks: <strong>{blocks.protectedBlocks || 0}</strong>
                  </div>
                  <p className="admin-card-text">
                    Capacity planning blocks reserved by practitioners across standard weekly schedules.
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">💡 Coach Recommendations</h3>
                  <Link to="/admin/recommendations" className="admin-card-link">All Advice →</Link>
                </div>
                <div className="admin-card-body">
                  <div className="stat-highlight">
                    <div className="stat-highlight-val">{recommendations.totalRecommendations || 0}</div>
                    <div className="stat-highlight-desc">Total Issued Recommendations</div>
                  </div>
                  <div className="recommendation-status-pills">
                    <span className="badge badge-warning">Pending: {recommendations.pendingRecommendations || 0}</span>
                    <span className="badge badge-success">Acknowledged: {recommendations.acknowledgedRecommendations || 0}</span>
                    <span className="badge badge-neutral">Dismissed: {recommendations.dismissedRecommendations || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
