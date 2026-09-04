import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import focusSessionReducer from './focusSessionSlice';
import sessionGoalReducer from './sessionGoalSlice';
import distractionLogReducer from './distractionLogSlice';
import focusBlockReducer from './focusBlockSlice';
import coachRecommendationReducer from './coachRecommendationSlice';

export const rootReducer = {
  auth: authReducer,
  focusSessions: focusSessionReducer,
  sessionGoals: sessionGoalReducer,
  distractionLogs: distractionLogReducer,
  focusBlocks: focusBlockReducer,
  coachRecommendations: coachRecommendationReducer,
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;
