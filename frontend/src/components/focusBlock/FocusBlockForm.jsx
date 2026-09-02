import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerBlock, clearError } from '../../store/slices/focusBlockSlice';

const FocusBlockForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.focusBlocks);

  const [dayOfWeek, setDayOfWeek] = useState('MONDAY');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [preferredSessionType, setPreferredSessionType] = useState('DEEP_WORK');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!startTime || !endTime) {
      setLocalError('Start time and end time are required.');
      return;
    }

    const payload = {
      dayOfWeek,
      startTime,
      endTime,
      preferredSessionType: preferredSessionType || null,
    };

    const result = await dispatch(registerBlock(payload));

    if (registerBlock.fulfilled.match(result)) {
      if (onClose) onClose();
    }
  };

  const activeError = localError || error;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Add Focus Block</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {activeError && <div className="error-banner">{activeError}</div>}

        <form onSubmit={handleSubmit} className="focus-block-form">
          <div className="form-group">
            <label htmlFor="dayOfWeek">Day of Week</label>
            <select
              id="dayOfWeek"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              required
            >
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
              <option value="SATURDAY">Saturday</option>
              <option value="SUNDAY">Sunday</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Start Time</label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time</label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="preferredSessionType">Preferred Session Type (Optional)</label>
            <select
              id="preferredSessionType"
              value={preferredSessionType}
              onChange={(e) => setPreferredSessionType(e.target.value)}
            >
              <option value="">None</option>
              <option value="DEEP_WORK">Deep Work</option>
              <option value="CREATIVE">Creative</option>
              <option value="REVIEW">Review</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Block'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FocusBlockForm;
