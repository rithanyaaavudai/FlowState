import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { issueRecommendation, clearError } from '../../store/slices/coachRecommendationSlice';

const CoachRecommendationForm = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.coachRecommendations);
  const { user } = useSelector((state) => state.auth);

  const role = user?.role || localStorage.getItem('flowstate_role') || '';
  const isAuthorized = role === 'FLOW_COACH' || role === 'PLATFORM_ADMIN';

  const [practitionerId, setPractitionerId] = useState('');
  const [recommendationText, setRecommendationText] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  if (!isAuthorized) {
    return (
      <div className="error-banner">
        Only Flow Coaches and Platform Admins can issue recommendations.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');

    if (!practitionerId.trim()) {
      setValidationError('Practitioner ID is required.');
      return;
    }

    if (recommendationText.trim().length < 10) {
      setValidationError('Recommendation text must be at least 10 characters long.');
      return;
    }

    const payload = {
      practitionerId: practitionerId.trim(),
      text: recommendationText.trim(),
      recommendationText: recommendationText.trim(),
      priority,
    };

    const resAction = await dispatch(issueRecommendation(payload));

    if (issueRecommendation.fulfilled.match(resAction)) {
      setSuccessMessage('Recommendation issued successfully.');
      setPractitionerId('');
      setRecommendationText('');
      setPriority('MEDIUM');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    }
  };

  const activeError = validationError || error;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Issue Coach Recommendation</h3>
          {onClose && (
            <button type="button" className="close-btn" onClick={onClose}>
              &times;
            </button>
          )}
        </div>

        {successMessage && <div className="alert success">{successMessage}</div>}
        {activeError && <div className="error-banner">{activeError}</div>}

        <form onSubmit={handleSubmit} className="recommendation-form">
          <div className="form-group">
            <label htmlFor="practitionerId">Practitioner ID</label>
            <input
              type="text"
              id="practitionerId"
              placeholder="Enter Practitioner ID or Username"
              value={practitionerId}
              onChange={(e) => setPractitionerId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="recommendationText">Recommendation Text</label>
            <textarea
              id="recommendationText"
              rows="4"
              placeholder="Provide constructive focus advice (min 10 chars)..."
              value={recommendationText}
              onChange={(e) => setRecommendationText(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>

          <div className="form-actions">
            {onClose && (
              <button type="button" className="btn secondary-btn" onClick={onClose}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn primary-btn" disabled={loading}>
              {loading ? 'Issuing...' : 'Issue Recommendation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoachRecommendationForm;
