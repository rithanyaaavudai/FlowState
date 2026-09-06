import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import adminService from '../../services/adminService';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('all');
  const [overview, setOverview] = useState(null);

  const fetchAnalytics = async (selectedPeriod) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getOverview(selectedPeriod);
      setOverview(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.response?.data?.message || 'Failed to load platform analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const sessions = overview?.sessions || {};
  const sessionTypes = overview?.sessionTypes || {};
  const distractions = overview?.distractions || {};
  const recommendations = overview?.recommendations || {};

  const totalSessions = sessions.totalSessions || 0;
  const completedSessions = sessions.completedSessions || 0;
  const abandonedSessions = sessions.abandonedSessions || 0;
  const inProgressSessions = sessions.inProgressSessions || 0;
  const scheduledSessions = sessions.scheduledSessions || 0;

  const completedPct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const abandonedPct = totalSessions > 0 ? Math.round((abandonedSessions / totalSessions) * 100) : 0;
  const inProgressPct = totalSessions > 0 ? Math.round((inProgressSessions / totalSessions) * 100) : 0;
  const scheduledPct = totalSessions > 0 ? Math.round((scheduledSessions / totalSessions) * 100) : 0;

  const totalDistractions = distractions.totalCount || 0;
  const totalRecs = recommendations.totalRecommendations || 0;
  const ackRecs = recommendations.acknowledgedRecommendations || 0;
  const recAckRate = totalRecs > 0 ? Math.round((ackRecs / totalRecs) * 100) : 0;

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-page-title">Platform Intelligence & Analytics</h2>
            <p className="admin-page-description">
              Deep telemetry on practitioner flow states, session completion trends, modality adoption, and distraction vectors.
            </p>
          </div>

          <div className="admin-filter-group">
            <span className="filter-label">Range:</span>
            <div className="btn-group-segmented">
              <button
                type="button"
                className={`btn-segment ${period === '7d' ? 'active' : ''}`}
                onClick={() => setPeriod('7d')}
              >
                7D
              </button>
              <button
                type="button"
                className={`btn-segment ${period === '30d' ? 'active' : ''}`}
                onClick={() => setPeriod('30d')}
              >
                30D
              </button>
              <button
                type="button"
                className={`btn-segment ${period === 'all' ? 'active' : ''}`}
                onClick={() => setPeriod('all')}
              >
                All Time
              </button>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fetchAnalytics(period)}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="admin-loading-state">
            <div className="spinner"></div>
            <p>Crunching analytics data...</p>
          </div>
        ) : (
          <div className="analytics-dashboard-grid">
            {/* Top Stat Row */}
            <div className="analytics-stat-row">
              <div className="stat-card-glass">
                <span className="glass-title">Overall Session Completion</span>
                <div className="glass-metric">{completedPct}%</div>
                <div className="glass-subtext">{completedSessions} of {totalSessions} successfully finished</div>
              </div>
              <div className="stat-card-glass">
                <span className="glass-title">Session Abandonment Rate</span>
                <div className="glass-metric text-warning">{abandonedPct}%</div>
                <div className="glass-subtext">{abandonedSessions} prematurely ended</div>
              </div>
              <div className="stat-card-glass">
                <span className="glass-title">Platform Average Focus Score</span>
                <div className="glass-metric text-cyan">{sessions.averageFocusScore || 0}/100</div>
                <div className="glass-subtext">Distraction-adjusted efficacy</div>
              </div>
              <div className="stat-card-glass">
                <span className="glass-title">Recommendation Adoption</span>
                <div className="glass-metric text-purple">{recAckRate}%</div>
                <div className="glass-subtext">{ackRecs} acknowledged of {totalRecs} issued</div>
              </div>
            </div>

            {/* Main Visualizations Grid */}
            <div className="admin-two-column-grid">
              {/* Session Status Distribution */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">📈 Session Lifecycle Breakdown</h3>
                </div>
                <div className="admin-card-body">
                  <div className="chart-bar-group">
                    <div className="chart-bar-item">
                      <div className="chart-bar-label">
                        <span>Completed</span>
                        <strong>{completedSessions} ({completedPct}%)</strong>
                      </div>
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill bar-green" style={{ width: `${completedPct}%` }}></div>
                      </div>
                    </div>

                    <div className="chart-bar-item">
                      <div className="chart-bar-label">
                        <span>In Progress</span>
                        <strong>{inProgressSessions} ({inProgressPct}%)</strong>
                      </div>
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill bar-purple" style={{ width: `${inProgressPct}%` }}></div>
                      </div>
                    </div>

                    <div className="chart-bar-item">
                      <div className="chart-bar-label">
                        <span>Scheduled</span>
                        <strong>{scheduledSessions} ({scheduledPct}%)</strong>
                      </div>
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill bar-cyan" style={{ width: `${scheduledPct}%` }}></div>
                      </div>
                    </div>

                    <div className="chart-bar-item">
                      <div className="chart-bar-label">
                        <span>Abandoned</span>
                        <strong>{abandonedSessions} ({abandonedPct}%)</strong>
                      </div>
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill bar-amber" style={{ width: `${abandonedPct}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Modality Analysis */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">🎯 Session Type Adoption</h3>
                </div>
                <div className="admin-card-body">
                  {Object.keys(sessionTypes).length === 0 ? (
                    <div className="admin-empty-subtext">No session modality telemetry recorded yet.</div>
                  ) : (
                    <div className="modality-visual-grid">
                      {Object.entries(sessionTypes).map(([type, count]) => {
                        const pct = totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0;
                        return (
                          <div key={type} className="modality-card">
                            <div className="modality-header">
                              <span className="modality-name">{type.replace('_', ' ')}</span>
                              <span className="modality-pct">{pct}%</span>
                            </div>
                            <div className="modality-count">{count} sessions</div>
                            <div className="modality-progress">
                              <div className="modality-fill" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Distraction Breakdown by Category */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">⚡ Distraction Frequency by Category</h3>
                </div>
                <div className="admin-card-body">
                  {distractions.countByCategory && Object.keys(distractions.countByCategory).length > 0 ? (
                    <div className="chart-bar-group">
                      {Object.entries(distractions.countByCategory).map(([cat, count]) => {
                        const pct = totalDistractions > 0 ? Math.round((count / totalDistractions) * 100) : 0;
                        const durationSec = distractions.durationByCategory?.[cat] || 0;
                        return (
                          <div key={cat} className="chart-bar-item">
                            <div className="chart-bar-label">
                              <span>{cat}</span>
                              <strong>{count} events ({Math.round(durationSec / 60)} mins)</strong>
                            </div>
                            <div className="chart-bar-track">
                              <div className="chart-bar-fill bar-indigo" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="admin-empty-subtext">No distraction logs recorded.</div>
                  )}
                </div>
              </div>

              {/* Coach Advisory Engagement */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">💡 Coach Advisory Efficacy</h3>
                </div>
                <div className="admin-card-body">
                  <div className="advisory-metric-grid">
                    <div className="advisory-box">
                      <span className="adv-label">Pending Review</span>
                      <span className="adv-val text-warning">{recommendations.pendingRecommendations || 0}</span>
                    </div>
                    <div className="advisory-box">
                      <span className="adv-label">Acknowledged</span>
                      <span className="adv-val text-success">{recommendations.acknowledgedRecommendations || 0}</span>
                    </div>
                    <div className="advisory-box">
                      <span className="adv-label">Dismissed</span>
                      <span className="adv-val text-neutral">{recommendations.dismissedRecommendations || 0}</span>
                    </div>
                  </div>
                  <div className="progress-bar-container">
                    <div className="multi-progress-bar">
                      <div
                        className="bar-segment bar-green"
                        style={{ width: `${totalRecs ? (recommendations.acknowledgedRecommendations / totalRecs) * 100 : 0}%` }}
                        title="Acknowledged"
                      />
                      <div
                        className="bar-segment bar-amber"
                        style={{ width: `${totalRecs ? (recommendations.pendingRecommendations / totalRecs) * 100 : 0}%` }}
                        title="Pending"
                      />
                      <div
                        className="bar-segment bar-neutral"
                        style={{ width: `${totalRecs ? (recommendations.dismissedRecommendations / totalRecs) * 100 : 0}%` }}
                        title="Dismissed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
