import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import adminService from '../../services/adminService';

const AdminFocusBlocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [dayFilter, setDayFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Delete modal state
  const [blockToDelete, setBlockToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBlocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllFocusBlocks();
      setBlocks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load focus blocks:', err);
      setError(err.response?.data?.message || 'Failed to load platform focus blocks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const handleDeleteClick = (block) => {
    setBlockToDelete(block);
  };

  const handleConfirmDelete = async () => {
    if (!blockToDelete) return;
    try {
      setDeleting(true);
      setError(null);
      await adminService.deleteFocusBlock(blockToDelete.id);
      setSuccessMessage(`Focus block #${blockToDelete.id} successfully removed from the schedule.`);
      setBlockToDelete(null);
      fetchBlocks();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to delete focus block:', err);
      setError(err.response?.data?.message || 'Failed to delete focus block.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredBlocks = blocks.filter((b) => {
    const matchesDay = dayFilter === 'ALL' || b.dayOfWeek === dayFilter;
    const matchesSearch =
      !search.trim() ||
      (b.practitionerName && b.practitionerName.toLowerCase().includes(search.toLowerCase())) ||
      (b.preferredSessionType && b.preferredSessionType.toLowerCase().includes(search.toLowerCase()));
    return matchesDay && matchesSearch;
  });

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

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
            <span className="stat-pill">Total Blocks: <strong>{blocks.length}</strong></span>
          </div>
        </div>

        {successMessage && (
          <div className="alert alert-success" role="alert">
            ✅ {successMessage}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            ❌ {error}
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
              />
            </div>

            <div className="form-group-inline">
              <label htmlFor="day-filter" className="filter-select-label">Day of Week:</label>
              <select
                id="day-filter"
                className="form-select"
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
              >
                <option value="ALL">All Days</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearch('');
                setDayFilter('ALL');
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Blocks Table */}
        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading-state">
              <div className="spinner"></div>
              <p>Loading focus blocks from capacity registry...</p>
            </div>
          ) : filteredBlocks.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon">🛡️</div>
              <h3>No focus blocks found</h3>
              <p>No recurring focus blocks match your current filters.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Practitioner</th>
                  <th>Day of Week</th>
                  <th>Time Interval</th>
                  <th>Duration</th>
                  <th>Preferred Modality</th>
                  <th>Protected Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.map((b) => (
                  <tr key={b.id} className="admin-table-row">
                    <td className="cell-id">#{b.id}</td>
                    <td className="cell-user font-medium">
                      <span className="user-name-tag">{b.practitionerName || `ID: ${b.practitionerId}`}</span>
                    </td>
                    <td>
                      <span className="day-badge">{b.dayOfWeek}</span>
                    </td>
                    <td>
                      <span className="time-tag">
                        {b.startTime || b.blockStartTime} → {b.endTime || b.blockEndTime}
                      </span>
                    </td>
                    <td>{b.durationMinutes} mins</td>
                    <td>
                      <span className="session-type-pill">
                        {b.preferredSessionType ? b.preferredSessionType.replace('_', ' ') : 'Any'}
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
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteClick(b)}
                        title="Delete Focus Block"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {blockToDelete && (
          <div className="modal-overlay" onClick={() => setBlockToDelete(null)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header modal-header-danger">
                <h3 className="modal-title">Confirm Focus Block Deletion</h3>
                <button type="button" className="close-btn" onClick={() => setBlockToDelete(null)}>×</button>
              </div>
              <div className="modal-body">
                <p className="modal-alert-text">
                  Are you sure you want to delete focus block <strong>#{blockToDelete.id}</strong> (
                  {blockToDelete.dayOfWeek} {blockToDelete.startTime || blockToDelete.blockStartTime} - {blockToDelete.endTime || blockToDelete.blockEndTime}
                  {blockToDelete.practitionerName ? ` for ${blockToDelete.practitionerName}` : ''})?
                </p>
                <div className="alert alert-warning" role="alert">
                  ⚠️ Deleting this block may affect the practitioner's scheduled capacity and automated availability.
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
                  {deleting ? 'Deleting Block...' : 'Confirm Delete'}
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
