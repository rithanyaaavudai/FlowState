import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSession, updateSession, clearError } from '../../store/slices/focusSessionSlice';

const FocusSessionForm = ({ initialData = null, onClose }) => {
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.focusSessions);

  const [title, setTitle] = useState('');
  const [plannedStart, setPlannedStart] = useState('');
  const [plannedEnd, setPlannedEnd] = useState('');
  const [sessionType, setSessionType] = useState('DEEP_WORK');
  const [notes, setNotes] = useState('');

  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const pad = (num) => String(num).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    document.querySelector('.modal-card')?.scrollIntoView({ behavior: 'smooth' });
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setPlannedStart(formatDateForInput(initialData.plannedStart));
      setPlannedEnd(formatDateForInput(initialData.plannedEnd));
      setSessionType(initialData.sessionType || 'DEEP_WORK');
      setNotes(initialData.notes || '');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');

    if (!plannedStart || !plannedEnd) {
      setValidationError('Planned start and end times are required.');
      return;
    }

    const startDate = new Date(plannedStart);
    const endDate = new Date(plannedEnd);

    if (endDate <= startDate) {
      setValidationError('Planned end time must be after planned start time.');
      return;
    }

    const durationMinutes = (endDate - startDate) / (1000 * 60);

    if (durationMinutes < 15) {
      setValidationError('Session must be at least 15 minutes long.');
      return;
    }

    if (durationMinutes > 480) {
      const confirmed = window.confirm(
        'Duration exceeds 8 hours (480 minutes). Are you sure you want to schedule this session?'
      );
      if (!confirmed) {
        return;
      }
    }

    const payload = {
      title,
      plannedStart: startDate.toISOString(),
      plannedEnd: endDate.toISOString(),
      sessionType,
      notes,
    };

    setIsSubmitting(true);
    let resultAction;

    if (initialData?.id) {
      resultAction = await dispatch(updateSession({ id: initialData.id, ...payload }));
    } else {
      resultAction = await dispatch(createSession(payload));
    }

    setIsSubmitting(false);

    if (createSession.fulfilled.match(resultAction) || updateSession.fulfilled.match(resultAction)) {
      const msg = initialData?.id
        ? 'FocusSession updated successfully.'
        : 'FocusSession scheduled successfully.';
      setSuccessMessage(msg);
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{initialData?.id ? 'Edit Focus Session' : 'Schedule Focus Session'}</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {successMessage && <div className="alert success">{successMessage}</div>}
        {validationError && <div className="error-banner">{validationError}</div>}
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="focus-session-form">
          <div className="form-group">
            <label htmlFor="title">Session Title</label>
            <input
              type="text"
              id="title"
              placeholder="e.g. Frontend Architecture Refactor"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="plannedStart">Planned Start</label>
            <input
              type="datetime-local"
              id="plannedStart"
              value={plannedStart}
              onChange={(e) => setPlannedStart(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="plannedEnd">Planned End</label>
            <input
              type="datetime-local"
              id="plannedEnd"
              value={plannedEnd}
              onChange={(e) => setPlannedEnd(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sessionType">Session Type</label>
            <select
              id="sessionType"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            >
              <option value="DEEP_WORK">Deep Work</option>
              <option value="CREATIVE">Creative</option>
              <option value="REVIEW">Review</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              placeholder="Context or specific objectives..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData?.id ? 'Update Session' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FocusSessionForm;
