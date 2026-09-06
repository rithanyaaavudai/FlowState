import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import adminService from '../../services/adminService';

const AdminRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    practitionerId: '',
    priority: 'MEDIUM',
    recommendationText: '',
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchRecommendationsAndPractitioners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [recsRes, usersRes] = await Promise.allSettled([
        adminService.getAllRecommendations(page, size),
        adminService.getAllUsers(),
      ]);

      if (recsRes.status === 'fulfilled' && recsRes.value) {
        const val = recsRes.value;
        if (val.content) {
          setRecommendations(val.content);
          setTotalPages(val.totalPages || 0);
          setTotalElements(val.totalElements || 0);
        } else if (Array.isArray(val)) {
          setRecommendations(val);
          setTotalPages(1);
          setTotalElements(val.length);
        }
      }

      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
        const practs = usersRes.value.filter((u) => u.role === 'PRACTITIONER');
        setPractitioners(practs);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError(err.response?.data?.message || 'Failed to load recommendation records.');
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchRecommendationsAndPractitioners();
  }, [fetchRecommendationsAndPractitioners]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.practitionerId) {
      setError('Please select a target practitioner.');
      return;
    }
    if (!formData.recommendationText.trim()) {
      setError('Please enter the recommendation advice.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await adminService.issueRecommendation({
        practitionerId: Number(formData.practitionerId),
        priority: formData.priority,
        recommendationText: formData.recommendationText.trim(),
      });

      setSuccessMessage('Coaching recommendation issued successfully.');
      setFormData({ practitionerId: '', priority: 'MEDIUM', recommendationText: '' });
      setShowForm(false);
      fetchRecommendationsAndPractitioners();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to issue recommendation:', err);
      setError(err.response?.data?.message || 'Failed to issue recommendation.');
    } finally {
      setSubmitting(false);
    }
  };

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

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'badge-danger';
      case 'MEDIUM':
        return 'badge-warning';
      case 'LOW':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACKNOWLEDGED':
        return 'badge-success';
      case 'PENDING':
        return 'badge-warning';
      case 'DISMISSED':
        return 'badge-neutral';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-page-title">Coach Advisory Management</h2>
            <p className="admin-page-description">
              Review all performance recommendations issued to practitioners, track acknowledgment metrics, or issue administrative guidance.
            </p>
          </div>
          <div className="admin-header-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '✖ Cancel Form' : '➕ Issue Recommendation'}
            </button>
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

        {/* Issue Recommendation Form Drawer */}
        {showForm && (
          <div className="admin-card form-drawer-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">💡 Issue New Coaching Recommendation</h3>
            </div>
            <div className="admin-card-body">
              <form onSubmit={handleFormSubmit}>
                <div className="form-grid-two">
                  <div className="form-group">
                    <label htmlFor="practitioner-select" className="form-label">
                      Target Practitioner <span className="required-star">*</span>
                    </label>
                    <select
                      id="practitioner-select"
                      name="practitionerId"
                      className="form-select"
                      value={formData.practitionerId}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select Practitioner...</option>
                      {practitioners.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName || p.username} ({p.email || `ID: ${p.id}`})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="priority-select" className="form-label">
                      Advisory Priority <span className="required-star">*</span>
                    </label>
                    <select
                      id="priority-select"
                      name="priority"
                      className="form-select"
                      value={formData.priority}
                      onChange={handleFormChange}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>
                </div>

                <div className="form-group margin-top-md">
                  <label htmlFor="recommendation-text" className="form-label">
                    Recommendation Guidance & Action Items <span className="required-star">*</span>
                  </label>
                  <textarea
                    id="recommendation-text"
                    name="recommendationText"
                    className="form-control textarea-field"
                    rows="4"
                    placeholder="Provide actionable guidance, e.g., 'Consider scheduling Deep Work blocks in 90-minute intervals before 11:00 AM to minimize digital interruption frequencies.'"
                    value={formData.recommendationText}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-actions margin-top-md">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Issuing Advisory...' : 'Submit Recommendation'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Recommendations Table */}
        <div className="admin-table-container margin-top-md">
          {loading ? (
            <div className="admin-loading-state">
              <div className="spinner"></div>
              <p>Loading recommendation history...</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon">💡</div>
              <h3>No coach recommendations found</h3>
              <p>No recommendations have been issued to practitioners yet.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Target Practitioner</th>
                  <th>Issued By</th>
                  <th>Advisory Recommendation</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Acknowledged At</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((rec) => (
                  <tr key={rec.id} className="admin-table-row">
                    <td className="cell-id">#{rec.id}</td>
                    <td className="cell-user font-medium">
                      <span className="user-name-tag">{rec.practitionerName || `ID: ${rec.practitionerId}`}</span>
                    </td>
                    <td>
                      <span className="coach-tag">{rec.coachName || `ID: ${rec.coachId}`}</span>
                    </td>
                    <td className="cell-advice">
                      <p className="advice-text">{rec.recommendationText}</p>
                    </td>
                    <td>
                      <span className={`badge ${getPriorityBadgeClass(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(rec.status)}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="cell-time text-muted">{formatDateTime(rec.createdAt)}</td>
                    <td className="cell-time text-muted">{formatDateTime(rec.acknowledgedAt)}</td>
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
              Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} recommendations)
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

export default AdminRecommendations;
