import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearError as clearFocusSessionError } from '../../store/slices/focusSessionSlice';
import { clearError as clearSessionGoalError } from '../../store/slices/sessionGoalSlice';
import { clearError as clearDistractionLogError } from '../../store/slices/distractionLogSlice';
import { clearError as clearFocusBlockError } from '../../store/slices/focusBlockSlice';
import { clearError as clearCoachRecError } from '../../store/slices/coachRecommendationSlice';
import { clearAuthError } from '../../store/slices/authSlice';

const ErrorHandler = ({ error: propError, onClear: propOnClear, children }) => {
  const dispatch = useDispatch();

  const reduxError = useSelector(
    (state) =>
      state?.focusSessions?.error ||
      state?.sessionGoals?.error ||
      state?.distractionLogs?.error ||
      state?.focusBlocks?.error ||
      state?.coachRecommendations?.error ||
      state?.auth?.error ||
      null
  );

  const activeError = propError !== undefined ? propError : reduxError;

  const handleClear = () => {
    if (propOnClear) {
      propOnClear();
    } else if (dispatch) {
      dispatch(clearFocusSessionError());
      dispatch(clearSessionGoalError());
      dispatch(clearDistractionLogError());
      dispatch(clearFocusBlockError());
      dispatch(clearCoachRecError());
      dispatch(clearAuthError());
    }
  };

  return (
    <>
      {activeError && (
        <div className="error-modal-overlay" role="alert">
          <div className="error-modal-card modal-card">
            <div className="error-header">
              <h3>Error Occurred</h3>
              <button
                type="button"
                className="close-btn"
                onClick={handleClear}
                aria-label="Close error"
              >
                &times;
              </button>
            </div>
            <div className="error-body">
              <p>{typeof activeError === 'string' ? activeError : activeError?.message || 'An error occurred'}</p>
            </div>
            <div className="error-footer">
              <button
                type="button"
                className="btn dismiss-btn"
                onClick={handleClear}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      {children || null}
    </>
  );
};

export default ErrorHandler;