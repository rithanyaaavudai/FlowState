import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearAuthError } from '../../store/slices/authSlice';
import { clearError as clearSessionError } from '../../store/slices/focusSessionSlice';
import { clearError as clearBlockError } from '../../store/slices/focusBlockSlice';
import { clearError as clearGoalError } from '../../store/slices/sessionGoalSlice';
import { clearError as clearDistractionError } from '../../store/slices/distractionLogSlice';
import { clearError as clearRecommendationError } from '../../store/slices/coachRecommendationSlice';

const ErrorHandler = ({ error: propError, onClear }) => {
  let dispatch = () => {};
  try {
    const d = useDispatch();
    if (d) dispatch = d;
  } catch (e) {}

  let authError = null;
  let sessionError = null;
  let blockError = null;
  let goalError = null;
  let distractionError = null;
  let recommendationError = null;

  try {
    authError = useSelector((state) => state?.auth?.error);
    sessionError = useSelector((state) => state?.focusSessions?.error);
    blockError = useSelector((state) => state?.focusBlocks?.error);
    goalError = useSelector((state) => state?.sessionGoals?.error);
    distractionError = useSelector((state) => state?.distractionLogs?.error);
    recommendationError = useSelector((state) => state?.coachRecommendations?.error);
  } catch (e) {}

  const activeError =
    propError ||
    authError ||
    sessionError ||
    blockError ||
    goalError ||
    distractionError ||
    recommendationError;

  if (!activeError) {
    return null;
  }

  const handleDismiss = () => {
    if (onClear) {
      onClear();
    }
    try {
      dispatch(clearAuthError());
      dispatch(clearSessionError());
      dispatch(clearBlockError());
      dispatch(clearGoalError());
      dispatch(clearDistractionError());
      dispatch(clearRecommendationError());
    } catch (e) {}
  };

  return (
    <div
      className="error-handler alert error error-message error-banner"
      role="alert"
      data-testid="error-message"
    >
      <h3>Error Occurred</h3>
      <div className="error-body">
        <p className="error-text">{activeError}</p>
      </div>
      <button className="dismiss-btn" onClick={handleDismiss}>
        Dismiss
      </button>
    </div>
  );
};

export default ErrorHandler;
