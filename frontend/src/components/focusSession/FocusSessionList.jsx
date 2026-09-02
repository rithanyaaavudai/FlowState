
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchMySessions,
  fetchAllSessions,
  startSession,
  completeSession,
  abandonSession,
  deleteSession,
  setFilterByStatus,
  setSearchQuery,
  clearError,
} from '../../store/slices/focusSessionSlice';
import SearchFilterBar from '../common/SearchFilterBar';
import EmptyState from '../common/EmptyState';
import FocusSessionForm from './FocusSessionForm';

const FocusSessionList = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    items,
    totalPages,
    filterByStatus,
    searchQuery,
    loading,
    error,
  } = useSelector((state) => state.focusSessions);

  const role = user?.role || localStorage.getItem('flowstate_role') || 'PRACTITIONER';
  const isPractitioner = role === 'PRACTITIONER';

  const [page, setPage] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [abandoningSessionId, setAbandoningSessionId] = useState(null);
  const [abandonReason, setAbandonReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadSessions = useCallback(() => {
    const params = {
      page,
      size: 10,
      status: filterByStatus || undefined,
      search: searchQuery || undefined,
    };

    if (isPractitioner) {
      dispatch(fetchMySessions(params));
    } else {
      dispatch(fetchAllSessions(params));
    }
  }, [dispatch, isPractitioner, page, filterByStatus, searchQuery]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleSearchChange = (val) => {
    dispatch(setSearchQuery(val));
    setPage(0);
  };

  const handleFilterChange = (val) => {
    dispatch(setFilterByStatus(val));
    setPage(0);
  };

  const handleStart = async (id) => {
    const res = await dispatch(startSession(id));
    if (startSession.fulfilled.match(res)) {
      setSuccessMessage('Session started successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleComplete = async (id) => {
    const res = await dispatch(completeSession(id));
    if (completeSession.fulfilled.match(res)) {
      setSuccessMessage('Session completed successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleAbandonSubmit = async (e) => {
    e.preventDefault();
    if (!abandoningSessionId) return;
    const res = await dispatch(
      abandonSession({ id: abandoningSessionId, reason: abandonReason })
    );
    if (abandonSession.fulfilled.match(res)) {
      setSuccessMessage('Session abandoned.');
      setAbandoningSessionId(null);
      setAbandonReason('');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this session?');
    if (!confirmed) return;
    const res = await dispatch(deleteSession(id));
    if (deleteSession.fulfilled.match(res)) {
      setSuccessMessage('FocusSession deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSession(null);
    loadSessions();
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const filteredItems = items.filter((item) => {
    if (filterByStatus && item.status !== filterByStatus) return false;
    if (
      searchQuery &&
      !item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="page-container focus-session-page">
      <div className="page-header">
        <h2>{isPractitioner ? 'My Focus Sessions' : 'All Sessions'}</h2>
        {isPractitioner && (
          <button
            className="btn primary-btn"
            onClick={() => {
              setEditingSession(null);
              setIsFormOpen(true);
            }}
          >
            + Schedule Session
          </button>
        )}
      </div>

      {successMessage && <div className="alert success">{successMessage}</div>}
      {error && (
        <div className="alert error">
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())}>Dismiss</button>
        </div>
      )}

      <SearchFilterBar
        placeholder="Search sessions by title..."
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={filterByStatus}
        onFilterChange={handleFilterChange}
      />

      {loading ? (
        <div className="loading-spinner">Loading sessions...</div>
      ) : filteredItems.length === 0 ? (
        <EmptyState message="No focus sessions found" />
      ) : (
        <div className="table-responsive">
          <table className="sessions-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((session) => {
                const id = session.id || session.sessionId;
                const status = session.status || 'SCHEDULED';
                const type = session.sessionType || session.type || 'DEEP_WORK';
                const score =
                  session.focusScore !== undefined && session.focusScore !== null
                    ? `${session.focusScore}%`
                    : 'N/A';

                const startFormatted = session.plannedStart
                  ? new Date(session.plannedStart).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : '';
                const endFormatted = session.plannedEnd
                  ? new Date(session.plannedEnd).toLocaleTimeString([], {
                      timeStyle: 'short',
                    })
                  : '';

                return (
                  <tr key={id}>
                    <td className="session-title">{session.title}</td>
                    <td>
                      <span className={`type-badge type-${type.toLowerCase()}`}>
                        {type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{`${startFormatted} - ${endFormatted}`}</td>
                    <td>
                      <span className={`status-badge status-${status.toLowerCase()}`}>
                        {status}
                      </span>
                    </td>
                    <td>{score}</td>
                    <td className="actions-cell">
                      {status === 'SCHEDULED' && (
                        <>
                          <button
                            className="btn action-btn start-btn"
                            onClick={() => handleStart(id)}
                          >
                            Start
                          </button>
                          <button
                            className="btn action-btn edit-btn"
                            onClick={() => handleEdit(session)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn action-btn delete-btn"
                            onClick={() => handleDelete(id)}
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {status === 'IN_PROGRESS' && (
                        <>
                          <button
                            className="btn action-btn complete-btn"
                            onClick={() => handleComplete(id)}
                          >
                            Complete
                          </button>
                          <button
                            className="btn action-btn abandon-btn"
                            onClick={() => {
                              setAbandoningSessionId(id);
                              setAbandonReason('');
                            }}
                          >
                            Abandon
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn pagination-btn"
            onClick={handlePrevPage}
            disabled={page === 0}
          >
            Prev
          </button>
          <span className="page-info">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="btn pagination-btn"
            onClick={handleNextPage}
            disabled={page >= totalPages - 1}
          >
            Next
          </button>
        </div>
      )}

      {isFormOpen && (
        <FocusSessionForm initialData={editingSession} onClose={handleCloseForm} />
      )}

      {abandoningSessionId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Abandon Session</h3>
            <form onSubmit={handleAbandonSubmit}>
              <div className="form-group">
                <label htmlFor="abandon-reason">Reason for abandoning:</label>
                <textarea
                  id="abandon-reason"
                  rows="3"
                  value={abandonReason}
                  onChange={(e) => setAbandonReason(e.target.value)}
                  placeholder="e.g. Urgent meeting called..."
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary-btn"
                  onClick={() => setAbandoningSessionId(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn danger-btn">
                  Confirm Abandon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusSessionList;
