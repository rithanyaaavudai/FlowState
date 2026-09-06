import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import adminService from '../../services/adminService';

const AdminFocusBlocks = () => {
  const [blocks, setBlocks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [dayFilter, setDayFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals state
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blockToDelete, setBlockToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBlocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setActionError(null);
      const data = await adminService.getAllFocusBlocks();
      const raw = data?.content ?? data ?? [];
      setBlocks(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('Failed to load focus blocks:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load platform focus blocks.';
      setError(msg);
      setBlocks(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const handleDeleteClick = (block) => {
    setActionError(null);
    setBlockToDelete(block);
  };

  const handleConfirmDelete = async () => {
    if (!blockToDelete) return;
    try {
      setDeleting(true);
      setActionError(null);
      await adminService.deleteFocusBlock(blockToDelete.id);
      const deletedId = blockToDelete.id;
      setBlocks((prev) => (prev ? prev.filter((b) => b.id !== deletedId) : []));
      setSuccessMessage(`Focus block #${deletedId} was successfully deleted.`);
      setBlockToDelete(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to delete focus block:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to delete focus block.';
      setActionError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const daysOfWeek = [
    { value: 'ALL', label: 'All Days' },
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
    { value: 'SUNDAY', label: 'Sunday' },
  ];

  const filteredBlocks = (blocks || []).filter((b) => {
    const matchesDay = dayFilter === 'ALL' || b.dayOfWeek === dayFilter;
    const searchLower = search.trim().toLowerCase();
    const matchesSearch =
      !searchLower ||
      (b.practitionerName && b.practitionerName.toLowerCase().includes(searchLower)) ||
      (b.preferredSessionType && b.preferredSessionType.toLowerCase().includes(searchLower)) ||
      (b.dayOfWeek && b.dayOfWeek.toLowerCase().includes(searchLower));
    return matchesDay && matchesSearch;
  });

  const handleResetFilters = () => {
    setSearch('');
    setDayFilter('ALL');
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-page-title">Focus Block Capacity Governance</h2>
            <p className="admin-page-description">
              Oversee, audit, and manage protected focus time blocks reserved by practitioners across their weekly schedules.
            </p>
          </div>
          <div className="admin-header-stats">
            {loading ? (
              <span className="stat-pill">Total Blocks: <strong>Loading...</strong></span>
            ) : error ? (
              <span className="stat-pill stat-pill-error">Total Blocks: <strong>--</strong></span>
            ) : (
              <span className="stat-pill">
                Total Blocks: <strong>{blocks ? blocks.length : 0}</strong>
              </span>
            )}
          </div>
        </div>

        {successMessage && (
          <div className="alert alert-success" role="alert">
            <span>✅ {successMessage}</span>
            <button
              type="button"
              className="notification-close"
              onClick={() => setSuccessMessage(null)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {actionError && (
          <div className="alert alert-danger" role="alert">
            <span>❌ {actionError}</span>
            <button
              type="button"
              className="notification-close"
              onClick={() => setActionError(null)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="admin-controls-card">
          <div className="admin-filter-row">
            <div className="form-group-inline flex-grow">
              <input
                type="text"
                className="form-control"
                placeholder="Search by practitioner name or preferred modality..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading || !!error}
              />
            </div>

            <div className="form-group-inline">
              <label htmlFor="day-filter" className="filter-select-label">Day of Week:</label>
              <select
                id="day-filter"
                className="form-select"
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                disabled={loading || !!error}
              >
                {daysOfWeek.map((day) => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetFilters}
              disabled={loading || !!error}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Main Content Area: Loading / Error / Empty / Success Table */}
        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading-state">
              <div className="spinner"></div>
              <p>Loading focus blocks from capacity registry...</p>
            </div>
          ) : error ? (
            <div className="admin-error-state">
              <div className="error-icon">⚠️</div>
              <h3>Unable to load focus blocks</h3>
              <p className="error-message-text">{error}</p>
              <button
                type="button"
                className="btn primary-btn retry-btn"
                onClick={fetchBlocks}
              >
                🔄 Retry
              </button>
            </div>
          ) : blocks && blocks.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon">🛡️</div>
              <h3>No focus blocks found</h3>
              <p>No recurring focus blocks are currently registered on the platform.</p>
            </div>
          ) : filteredBlocks.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No matching focus blocks</h3>
              <p>Try changing your search keywords or day of week filter.</p>
              <button
                type="button"
                className="btn secondary-btn"
                style={{ marginTop: '0.75rem' }}
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Practitioner</th>
                  <th>Day</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Session Type</th>
                  <th>Protected</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.map((b) => (
                  <tr key={b.id} className="admin-table-row">
                    <td className="cell-user font-medium">
                      <span className="user-name-tag">
                        {b.practitionerName || `Practitioner #${b.practitionerId}`}
                      </span>
                    </td>
                    <td>
                      <span className="day-badge">{b.dayOfWeek}</span>
                    </td>
                    <td>
                      <span className="time-tag">
                        {b.startTime || b.blockStartTime || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="time-tag">
                        {b.endTime || b.blockEndTime || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="session-type-pill">
                        {b.preferredSessionType
                          ? b.preferredSessionType.replace('_', ' ')
                          : 'Standard'}
                      </span>
                    </td>
                    <td>
                      {b.isProtected || b.protected ? (
                        <span className="badge badge-success">🛡️ Protected</span>
                      ) : (
                        <span className="badge badge-neutral">Standard</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions-cell" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-cyan"
                          onClick={() => setSelectedBlock(b)}
                          title="View Details"
                        >
                          👁️ View
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteClick(b)}
                          title="Delete Focus Block"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* View Focus Block Details Modal */}
        {selectedBlock && (
          <div className="modal-overlay" onClick={() => setSelectedBlock(null)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <div className="modal-eyebrow">Focus Block Details</div>
                  <h3 className="modal-title">Block #{selectedBlock.id}</h3>
                </div>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setSelectedBlock(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-grid-two">
                  <div className="detail-item detail-box">
                    <span className="detail-label">Practitioner</span>
                    <span className="detail-value">
                      {selectedBlock.practitionerName || `ID: ${selectedBlock.practitionerId}`}
                    </span>
                  </div>
                  <div className="detail-item detail-box">
                    <span className="detail-label">Practitioner ID</span>
                    <span className="detail-value">#{selectedBlock.practitionerId}</span>
                  </div>
                  <div className="detail-item detail-box">
                    <span className="detail-label">Day of Week</span>
                    <span className="detail-value">{selectedBlock.dayOfWeek}</span>
                  </div>
                  <div className="detail-item detail-box">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{selectedBlock.durationMinutes || 0} mins</span>
                  </div>
                  <div className="detail-item detail-box">
                    <span className="detail-label">Start Time</span>
                    <span className="detail-value">{selectedBlock.startTime || selectedBlock.blockStartTime}</span>
                  </div>
                  <div className="detail-item detail-box">
                    <span className="detail-label">End Time</span>
                    <span className="detail-value">{selectedBlock.endTime || selectedBlock.blockEndTime}</span>
                  </div>
                  <div className="detail-item detail-box">
                    <span className="detail-label">Preferred Session Type</span>
                    <span className="detail-value">
                      {selectedBlock.preferredSessionType ? selectedBlock.preferredSessionType.replace('_', ' ') : 'None specified'}
                    </span>
                  </div>
                  <div className="detail-item detail-box">
                    <span className="detail-label">Protected Status</span>
                    <span className="detail-value">
                      {selectedBlock.isProtected || selectedBlock.protected ? '🛡️ Protected Block' : 'Standard Block'}
                    </span>
                  </div>
                </div>
                {selectedBlock.createdAt && (
                  <div className="detail-box">
                    <span className="detail-label">Created At</span>
                    <span className="detail-value">
                      {new Date(selectedBlock.createdAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedBlock(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    const b = selectedBlock;
                    setSelectedBlock(null);
                    handleDeleteClick(b);
                  }}
                >
                  🗑️ Delete Block
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {blockToDelete && (
          <div className="modal-overlay" onClick={() => !deleting && setBlockToDelete(null)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header modal-header-danger">
                <div>
                  <div className="modal-eyebrow" style={{ color: '#f87171' }}>Delete Confirmation</div>
                  <h3 className="modal-title">Delete this focus block?</h3>
                </div>
                <button
                  type="button"
                  className="close-btn"
                  disabled={deleting}
                  onClick={() => setBlockToDelete(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p className="modal-alert-text">
                  Are you sure you want to remove this focus block?
                </p>
                <div className="detail-box alert-warning-box">
                  <p><strong>Block ID:</strong> #{blockToDelete.id}</p>
                  <p><strong>Practitioner:</strong> {blockToDelete.practitionerName || `ID: ${blockToDelete.practitionerId}`}</p>
                  <p><strong>Schedule:</strong> {blockToDelete.dayOfWeek} ({blockToDelete.startTime || blockToDelete.blockStartTime} → {blockToDelete.endTime || blockToDelete.blockEndTime})</p>
                  {blockToDelete.preferredSessionType && (
                    <p><strong>Type:</strong> {blockToDelete.preferredSessionType.replace('_', ' ')}</p>
                  )}
                </div>
                <div className="alert alert-warning" role="alert" style={{ marginBottom: 0 }}>
                  ⚠️ Removing this focus block may alter the practitioner's weekly capacity calculations and scheduled availability.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={deleting}
                  onClick={() => setBlockToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                >
                  {deleting ? 'Deleting Focus Block...' : 'Delete Focus Block'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFocusBlocks;
