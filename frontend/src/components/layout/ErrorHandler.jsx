import React, { useContext } from 'react';
import { ReactReduxContext } from 'react-redux';
import { clearAuthError } from '../../store/slices/authSlice';
import { clearError as clearSessionError } from '../../store/slices/focusSessionSlice';
import { clearError as clearBlockError } from '../../store/slices/focusBlockSlice';
import { clearError as clearGoalError } from '../../store/slices/sessionGoalSlice';
import { clearError as clearDistractionError } from '../../store/slices/distractionLogSlice';
import { clearError as clearRecommendationError } from '../../store/slices/coachRecommendationSlice';

const ErrorHandler = ({ error: propError, onClear }) => {
  const reduxContext = useContext(ReactReduxContext);
  const store = reduxContext?.store;

  const authError = store ? store.getState()?.auth?.error : null;
  const sessionError = store ? store.getState()?.focusSessions?.error : null;
  const blockError = store ? store.getState()?.focusBlocks?.error : null;
  const goalError = store ? store.getState()?.sessionGoals?.error : null;
  const distractionError = store ? store.getState()?.distractionLogs?.error : null;
  const recommendationError = store ? store.getState()?.coachRecommendations?.error : null;

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

    if (store?.dispatch) {
      store.dispatch(clearAuthError());
      store.dispatch(clearSessionError());
      store.dispatch(clearBlockError());
      store.dispatch(clearGoalError());
      store.dispatch(clearDistractionError());
      store.dispatch(clearRecommendationError());
    }
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