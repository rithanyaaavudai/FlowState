import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import adminService from '../../services/adminService';

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Selected session for detail modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionGoals, setSessionGoals] = useState([]);
  const [sessionDistractions, setSessionDistractions] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllSessions({
        search: search.trim(),
        status: statusFilter,
        page,
        size,
      });

      if (data && data.content) {
        setSessions(data.content);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setSessions(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error('Failed to load focus sessions:', err);
      setError(err.response?.data?.message || 'Failed to load focus sessions.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, size]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchSessions();
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleViewDetails = async (session) => {
    setSelectedSession(session);
    setLoadingDetails(true);
    try {
      const [goals, distractions] = await Promise.allSettled([
        adminService.getSessionGoals(session.id),
        adminService.getSessionDistractions(session.id),
      ]);
      setSessionGoals(goals.status === 'fulfilled' ? goals.value : []);
      setSessionDistractions(distractions.status === 'fulfilled' ? distractions.value : []);
    } catch (err) {
      console.error('Failed to load session details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedSession(null);
    setSessionGoals([]);
    setSessionDistractions([]);
  };

  const formatDateTime = (dt) => {
    if (!dt) return '—';
    const date = new Date(dt);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'badge-success';
      case 'IN_PROGRESS':
        return 'badge-info';
      case 'SCHEDULED':
        return 'badge-neutral';
      case 'ABANDONED':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-page-title">All Focus Sessions Oversight</h2>
            <p className="admin-page-description">
              Audit, inspect, and monitor focus sessions across all registered practitioners in the platform.
            </p>
          </div>
          <div className="admin-header-stats">
            <span className="stat-pill">Total Found: <strong>{totalElements}</strong></span>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-controls-card">
          <form className="admin-filter-row" onSubmit={handleSearchSubmit}>
            <div className="form-group-inline flex-grow">
              <label htmlFor="session-search" className="sr-only">Search</label>
              <input
                id="session-search"
                type="text"
                className="form-control"
                placeholder="Search by session title or practitioner name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="form-group-inline">
              <label htmlFor="status-filter" className="filter-select-label">Status:</label>
              <select
                id="status-filter"
                className="form-select"
                value={statusFilter}
                onChange={handleStatusChange}
              >
                <option value="ALL">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ABANDONED">Abandoned</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              Filter
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setPage(0);
              }}
            >
              Reset
            </button>
          </form>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Sessions Table */}
        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading-state">
              <div className="spinner"></div>
              <p>Fetching session records...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon">📂</div>
              <h3>No focus sessions found</h3>
              <p>No sessions match your search and filter criteria.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Session Title</th>
                  <th>Practitioner</th>
                  <th>Modality</th>
                  <th>Planned Schedule</th>
                  <th>Status</th>
                  <th>Focus Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="admin-table-row">
                    <td className="cell-id">#{s.id}</td>
                    <td className="cell-title font-medium">{s.title || 'Untitled Session'}</td>
                    <td className="cell-user">
                      <span className="user-name-tag">{s.practitionerName || `ID: ${s.practitionerId}`}</span>
                    </td>
                    <td>
                      <span className="session-type-pill">
                        {s.sessionType ? s.sessionType.replace('_', ' ') : '—'}
                      </span>
                    </td>
                    <td className="cell-schedule">
                      <div className="time-range">
                        <span>{formatDateTime(s.plannedStart)}</span>
                        <span className="time-separator">→</span>
                        <span>{formatDateTime(s.plannedEnd)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      {s.focusScore !== null && s.focusScore !== undefined ? (
                        <span className={`score-badge ${s.focusScore >= 80 ? 'score-high' : s.focusScore >= 50 ? 'score-mid' : 'score-low'}`}>
                          {s.focusScore}/100
                        </span>
                      ) : (
                        <span className="score-na">—</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-cyan"
                        onClick={() => handleViewDetails(s)}
                      >
                        Inspect Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
              Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} sessions)
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

        {/* Session Detail Modal */}
        {selectedSession && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <span className="modal-eyebrow">Session #{selectedSession.id} Detail</span>
                  <h3 className="modal-title">{selectedSession.title}</h3>
                </div>
                <button type="button" className="close-btn" onClick={closeModal}>×</button>
              </div>

              <div className="modal-body">
                {/* Meta details */}
                <div className="modal-grid-two">
                  <div className="detail-item">
                    <span className="detail-label">Practitioner</span>
                    <span className="detail-value">{selectedSession.practitionerName || `ID: ${selectedSession.practitionerId}`}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`badge ${getStatusBadgeClass(selectedSession.status)}`}>
                      {selectedSession.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Session Type</span>
                    <span className="detail-value">{selectedSession.sessionType || 'Standard'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Calculated Focus Score</span>
                    <span className="detail-value font-bold">
                      {selectedSession.focusScore !== null ? `${selectedSession.focusScore}/100` : 'Not scored'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Planned Timeline</span>
                    <span className="detail-value text-muted">
                      {formatDateTime(selectedSession.plannedStart)} to {formatDateTime(selectedSession.plannedEnd)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Actual Timeline</span>
                    <span className="detail-value text-muted">
                      {selectedSession.actualStart ? `${formatDateTime(selectedSession.actualStart)} to ${formatDateTime(selectedSession.actualEnd)}` : 'Not recorded'}
                    </span>
                  </div>
                </div>

                {selectedSession.notes && (
                  <div className="detail-box">
                    <span className="detail-label">Practitioner Session Notes:</span>
                    <p className="detail-text">{selectedSession.notes}</p>
                  </div>
                )}

                {selectedSession.abandonReason && (
                  <div className="detail-box alert-warning-box">
                    <span className="detail-label">Abandonment Reason:</span>
                    <p className="detail-text">{selectedSession.abandonReason}</p>
                  </div>
                )}

                {/* Sub-items: Goals & Distractions */}
                {loadingDetails ? (
                  <div className="details-loading">
                    <div className="spinner-small"></div>
                    <span>Loading session goals and distraction logs...</span>
                  </div>
                ) : (
                  <div className="modal-subsections">
                    {/* Goals */}
                    <div className="modal-subsection">
                      <h4 className="subsection-title">🎯 Session Goals ({sessionGoals.length})</h4>
                      {sessionGoals.length === 0 ? (
                        <p className="subtext-muted">No specific micro-goals set for this session.</p>
                      ) : (
                        <ul className="goals-inspect-list">
                          {sessionGoals.map((g) => (
                            <li key={g.id} className={`goal-inspect-item status-${g.status?.toLowerCase()}`}>
                              <span className="goal-status-icon">
                                {g.status === 'ACHIEVED' ? '✅' : g.status === 'MISSED' ? '❌' : '⏳'}
                              </span>
                              <span className="goal-desc">{g.description}</span>
                              <span className="goal-status-badge">{g.status}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Distractions */}
                    <div className="modal-subsection">
                      <h4 className="subsection-title">⚡ Distraction Events ({sessionDistractions.length})</h4>
                      {sessionDistractions.length === 0 ? (
                        <p className="subtext-muted">Zero distractions reported during this session! Excellent focus.</p>
                      ) : (
                        <ul className="distractions-inspect-list">
                          {sessionDistractions.map((d) => (
                            <li key={d.id} className="distraction-inspect-item">
                              <span className="distraction-cat-tag">{d.category}</span>
                              <span className="distraction-desc">{d.description || 'No description'}</span>
                              <span className="distraction-dur">{d.durationSeconds}s ({Math.round(d.durationSeconds / 60)} min)</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSessions;
