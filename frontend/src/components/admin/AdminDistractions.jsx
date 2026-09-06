import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import adminService from '../../services/adminService';

const AdminDistractions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [breakdownError, setBreakdownError] = useState(null);
  const [trendError, setTrendError] = useState(null);
  const [logsError, setLogsError] = useState(null);

  const [breakdown, setBreakdown] = useState(null);
  const [trend, setTrend] = useState(null);
  const [logs, setLogs] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchDistractionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setBreakdownError(null);
      setTrendError(null);
      setLogsError(null);

      const [breakdownRes, trendRes, logsRes] = await Promise.allSettled([
        adminService.getDistractionBreakdown(),
        adminService.getDistractionTrend(),
        adminService.getDistractionLogs(page, size),
      ]);

      let hasCriticalError = false;

      if (breakdownRes.status === 'fulfilled') {
        setBreakdown(breakdownRes.value || { countByCategory: {}, durationSecondsByCategory: {} });
      } else {
        setBreakdown(null);
        const msg = breakdownRes.reason?.response?.data?.message || 'Failed to load interruption breakdown.';
        setBreakdownError(msg);
        hasCriticalError = true;
      }

      if (trendRes.status === 'fulfilled') {
        setTrend(Array.isArray(trendRes.value) ? trendRes.value : []);
      } else {
        setTrend(null);
        const msg = trendRes.reason?.response?.data?.message || 'Unable to load weekly interruption trend.';
        setTrendError(msg);
      }

      if (logsRes.status === 'fulfilled') {
        const val = logsRes.value;
        if (val && val.content) {
          setLogs(val.content);
          setTotalPages(val.totalPages || 0);
          setTotalElements(val.totalElements || 0);
        } else if (Array.isArray(val)) {
          setLogs(val);
          setTotalPages(1);
          setTotalElements(val.length);
        } else {
          setLogs([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } else {
        setLogs(null);
        const msg = logsRes.reason?.response?.data?.message || 'Failed to load distraction audit log.';
        setLogsError(msg);
      }

      if (hasCriticalError && trendRes.status === 'rejected') {
        setError('Unable to load distraction metrics.');
      }
    } catch (err) {
      console.error('Failed to load distraction metrics:', err);
      setError(err.response?.data?.message || 'Unable to load distraction metrics.');
      setBreakdown(null);
      setTrend(null);
      setLogs(null);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchDistractionData();
  }, [fetchDistractionData]);

  // Derived metrics from real data only
  const countMap = breakdown?.countByCategory || {};
  const durationMap = breakdown?.durationSecondsByCategory || {};

  const totalDistractionCount = breakdown
    ? Object.values(countMap).reduce((acc, val) => acc + (val || 0), 0)
    : null;
  const totalDurationSec = breakdown
    ? Object.values(durationMap).reduce((acc, val) => acc + (val || 0), 0)
    : null;
  const totalDurationMins = totalDurationSec != null ? Math.round(totalDurationSec / 60) : null;
  const avgDurationSec =
    totalDistractionCount != null && totalDistractionCount > 0
      ? Math.round(totalDurationSec / totalDistractionCount)
      : totalDistractionCount === 0
      ? 0
      : null;

  const formatDateTime = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-page-title">Platform Distraction Telemetry</h2>
            <p className="admin-page-description">
              Identify environmental interruptions, context-switching triggers, and cumulative time losses across focus sessions.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchDistractionData}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>⚠️ {error}</span>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={fetchDistractionData}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card card-amber">
            <div className="kpi-header">
              <span className="kpi-title">Total Interruption Events</span>
              <span className="kpi-icon">⚡</span>
            </div>
            <div className="kpi-value">
              {loading ? (
                'Loading...'
              ) : totalDistractionCount != null ? (
                totalDistractionCount
              ) : (
                '--'
              )}
            </div>
            <div className="kpi-footer">
              {loading ? (
                <span className="kpi-subtext">Fetching data...</span>
              ) : totalDistractionCount != null ? (
                <span className="kpi-badge badge-warning">Logged platform-wide</span>
              ) : (
                <span className="kpi-subtext" style={{ color: '#f87171' }}>Metrics unavailable</span>
              )}
            </div>
          </div>

          <div className="admin-kpi-card card-indigo">
            <div className="kpi-header">
              <span className="kpi-title">Cumulative Time Lost</span>
              <span className="kpi-icon">⏳</span>
            </div>
            <div className="kpi-value">
              {loading ? (
                'Loading...'
              ) : totalDurationMins != null ? (
                <>
                  {totalDurationMins} <span className="kpi-unit">min</span>
                </>
              ) : (
                '--'
              )}
            </div>
            <div className="kpi-footer">
              {loading ? (
                <span className="kpi-subtext">Fetching data...</span>
              ) : totalDurationMins != null ? (
                <span className="kpi-badge badge-secondary">
                  {Math.round((totalDurationMins / 60) * 10) / 10} hours
                </span>
              ) : (
                <span className="kpi-subtext" style={{ color: '#f87171' }}>Metrics unavailable</span>
              )}
            </div>
          </div>

          <div className="admin-kpi-card card-purple">
            <div className="kpi-header">
              <span className="kpi-title">Average Interruption Duration</span>
              <span className="kpi-icon">⏱️</span>
            </div>
            <div className="kpi-value">
              {loading ? (
                'Loading...'
              ) : avgDurationSec != null ? (
                <>
                  {avgDurationSec} <span className="kpi-unit">sec</span>
                </>
              ) : (
                '--'
              )}
            </div>
            <div className="kpi-footer">
              {loading ? (
                <span className="kpi-subtext">Fetching data...</span>
              ) : avgDurationSec != null ? (
                <span className="kpi-badge badge-info">
                  {Math.round((avgDurationSec / 60) * 10) / 10} mins avg
                </span>
              ) : (
                <span className="kpi-subtext" style={{ color: '#f87171' }}>Metrics unavailable</span>
              )}
            </div>
          </div>
        </div>

        {/* Visual Category & Weekly Trend Breakdown */}
        <div className="admin-two-column-grid">
          {/* Category Breakdown */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">📊 Interruption Vectors by Category</h3>
            </div>
            <div className="admin-card-body">
              {loading ? (
                <div className="admin-loading-state" style={{ padding: '2rem 1rem' }}>
                  <div className="spinner-small"></div>
                  <p>Loading breakdown...</p>
                </div>
              ) : breakdownError ? (
                <div className="admin-empty-state" style={{ padding: '2rem 1rem' }}>
                  <div className="empty-icon" style={{ fontSize: '1.8rem' }}>⚠️</div>
                  <p style={{ color: '#f87171' }}>{breakdownError}</p>
                  <button
                    type="button"
                    className="btn btn-sm secondary-btn"
                    style={{ marginTop: '0.5rem' }}
                    onClick={fetchDistractionData}
                  >
                    Retry
                  </button>
                </div>
              ) : breakdown && Object.keys(countMap).length === 0 ? (
                <div className="admin-empty-state" style={{ padding: '2rem 1rem' }}>
                  <div className="empty-icon" style={{ fontSize: '1.8rem' }}>🛡️</div>
                  <p>No distraction categories recorded yet.</p>
                </div>
              ) : (
                <div className="chart-bar-group">
                  {Object.entries(countMap).map(([category, count]) => {
                    const pct =
                      totalDistractionCount > 0
                        ? Math.round((count / totalDistractionCount) * 100)
                        : 0;
                    const dur = durationMap[category] || 0;
                    return (
                      <div key={category} className="chart-bar-item">
                        <div className="chart-bar-label">
                          <span className="font-semibold">{category}</span>
                          <span>
                            <strong>{count} events</strong> ({pct}%) • {Math.round(dur / 60)} min lost
                          </span>
                        </div>
                        <div className="chart-bar-track">
                          <div
                            className="chart-bar-fill bar-amber"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">📅 Weekly Interruption Trend</h3>
            </div>
            <div className="admin-card-body">
              {loading ? (
                <div className="admin-loading-state" style={{ padding: '2rem 1rem' }}>
                  <div className="spinner-small"></div>
                  <p>Loading weekly trend...</p>
                </div>
              ) : trendError ? (
                <div className="admin-empty-state" style={{ padding: '2rem 1rem' }}>
                  <div className="empty-icon" style={{ fontSize: '1.8rem' }}>⚠️</div>
                  <p style={{ color: '#f87171' }}>Unable to load weekly interruption trend.</p>
                  <button
                    type="button"
                    className="btn btn-sm secondary-btn"
                    style={{ marginTop: '0.5rem' }}
                    onClick={fetchDistractionData}
                  >
                    Retry
                  </button>
                </div>
              ) : trend && trend.length === 0 ? (
                <div className="admin-empty-state" style={{ padding: '2rem 1rem' }}>
                  <div className="empty-icon" style={{ fontSize: '1.8rem' }}>📅</div>
                  <p>No historical weekly trend data available yet.</p>
                </div>
              ) : (
                <div className="trend-table-container">
                  <table className="admin-table table-compact">
                    <thead>
                      <tr>
                        <th>Year / Week</th>
                        <th>Incident Count</th>
                        <th>Trend Intensity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(trend || []).map((t, idx) => {
                        const maxCount = Math.max(
                          ...(trend || []).map((item) => Number(item.count) || 1)
                        );
                        const currentCount = Number(t.count) || 0;
                        const pct = Math.round((currentCount / maxCount) * 100);
                        return (
                          <tr key={idx}>
                            <td>Week {t.week}</td>
                            <td>
                              <strong>{currentCount}</strong> events
                            </td>
                            <td>
                              <div className="chart-bar-track" style={{ height: '8px' }}>
                                <div
                                  className="chart-bar-fill bar-purple"
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Paginated Distraction Events Table */}
        <div className="admin-section-header margin-top-lg">
          <div>
            <h3 className="admin-subsection-title">Distraction Incident Audit Log</h3>
            <p className="admin-page-description">
              Detailed chronologically ordered distraction events reported during live sessions.
            </p>
          </div>
          <span className="stat-pill">
            Total Logged: <strong>{loading ? 'Loading...' : logsError ? '--' : totalElements}</strong>
          </span>
        </div>

        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading-state">
              <div className="spinner"></div>
              <p>Loading distraction records...</p>
            </div>
          ) : logsError ? (
            <div className="admin-error-state">
              <div className="error-icon">⚠️</div>
              <h3>Unable to load distraction incident logs</h3>
              <p className="error-message-text">{logsError}</p>
              <button
                type="button"
                className="btn primary-btn retry-btn"
                onClick={fetchDistractionData}
              >
                🔄 Retry
              </button>
            </div>
          ) : logs && logs.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon">🛡️</div>
              <h3>No distraction events recorded</h3>
              <p>Platform practitioners are maintaining uninterrupted focus.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Session Title</th>
                  <th>Practitioner</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Duration</th>
                  <th>Logged At</th>
                </tr>
              </thead>
              <tbody>
                {(logs || []).map((log) => (
                  <tr key={log.id} className="admin-table-row">
                    <td className="cell-id">#{log.id}</td>
                    <td className="cell-title font-medium">
                      {log.sessionTitle || `Session #${log.sessionId}`}
                    </td>
                    <td className="cell-user">
                      <span className="user-name-tag">
                        {log.practitionerName || (log.practitionerId ? `ID: ${log.practitionerId}` : '—')}
                      </span>
                    </td>
                    <td>
                      <span className="category-badge">{log.category}</span>
                    </td>
                    <td className="cell-desc text-muted">{log.description || '—'}</td>
                    <td>
                      <span className="duration-tag">
                        {log.durationSeconds}s ({Math.round(log.durationSeconds / 60)}m)
                      </span>
                    </td>
                    <td className="cell-time text-muted">
                      {formatDateTime(log.loggedAt || log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !logsError && totalPages > 1 && (
          <div className="admin-pagination">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              ← Previous
            </button>
            <span className="page-indicator">
              Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDistractions;

