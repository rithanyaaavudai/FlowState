import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchMinePending,
  fetchMineIssued,
  acknowledgeRecommendation,
  dismissRecommendation,
} from '../../store/slices/coachRecommendationSlice';
import EmptyState from '../common/EmptyState';
import CoachRecommendationForm from './CoachRecommendationForm';

const CoachRecommendationList = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, pending, loading, error } = useSelector(
    (state) => state.coachRecommendations
  );

  const role = user?.role || localStorage.getItem('flowstate_role') || '';
  const isPractitioner = role === 'PRACTITIONER';
  const isCoach = role === 'FLOW_COACH' || role === 'PLATFORM_ADMIN';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isPractitioner) {
      dispatch(fetchMinePending());
    } else if (isCoach) {
      dispatch(fetchMineIssued({ page: 0, size: 10 }));
    }
  }, [dispatch, isPractitioner, isCoach]);

  const handleAcknowledge = async (id) => {
    const res = await dispatch(acknowledgeRecommendation(id));
    if (acknowledgeRecommendation.fulfilled.match(res)) {
      setSuccessMessage('Recommendation acknowledged.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleDismiss = async (id) => {
    const res = await dispatch(dismissRecommendation(id));
    if (dismissRecommendation.fulfilled.match(res)) {
      setSuccessMessage('Recommendation dismissed.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const activeList = isPractitioner ? pending : items;

  return (
    <div className="page-container recommendation-page">
      <div className="page-header">
        <h2>
          {isPractitioner
            ? 'Pending Recommendations'
            : 'Issued Recommendations'}
        </h2>

        {isCoach && (
          <button
            className="btn primary-btn"
            onClick={() => setIsFormOpen(true)}
          >
            + New Recommendation
          </button>
        )}
      </div>

      {successMessage && <div className="alert success">{successMessage}</div>}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading recommendations...</div>
      ) : activeList.length === 0 ? (
        <EmptyState
          message={
            isPractitioner
              ? 'No pending recommendations'
              : 'No recommendations issued yet'
          }
        />
      ) : (
        <div className="recommendations-grid">
          {activeList.map((rec) => {
            const text = rec.recommendationText || rec.text || '';
            const priority = rec.priority || 'MEDIUM';
            const status = rec.status || 'PENDING';

            return (
              <div key={rec.id} className="recommendation-card">
                <div className="rec-header">
                  <span className={`priority-badge priority-${priority.toLowerCase()}`}>
                    {priority} Priority
                  </span>
                  <span className={`status-badge status-${status.toLowerCase()}`}>
                    {status}
                  </span>
                </div>

                <div className="rec-text">{text}</div>

                {isCoach && rec.practitionerName && (
                  <div className="rec-target">
                    To: {rec.practitionerName || rec.practitionerId}
                  </div>
                )}

                {isPractitioner && status === 'PENDING' && (
                  <div className="rec-actions">
                    <button
                      className="btn action-btn acknowledge-btn"
                      onClick={() => handleAcknowledge(rec.id)}
                    >
                      Acknowledge
                    </button>
                    <button
                      className="btn action-btn dismiss-btn"
                      onClick={() => handleDismiss(rec.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isFormOpen && (
        <CoachRecommendationForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            if (isCoach) dispatch(fetchMineIssued({ page: 0, size: 10 }));
          }}
        />
      )}
    </div>
  );
};

export default CoachRecommendationList;
