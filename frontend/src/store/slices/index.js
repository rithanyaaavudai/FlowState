import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import focusSessionReducer from './focusSessionSlice';
import sessionGoalReducer from './sessionGoalSlice';
import distractionLogReducer from './distractionLogSlice';
import focusBlockReducer from './focusBlockSlice';
import coachRecommendationReducer from './coachRecommendationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    focusSessions: focusSessionReducer,
    sessionGoals: sessionGoalReducer,
    distractionLogs: distractionLogReducer,
    focusBlocks: focusBlockReducer,
    coachRecommendations: coachRecommendationReducer,
  },
});

export default store;
