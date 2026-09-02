import api from './api';

export const sessionGoalService = {
  attachGoal: async (payload) => {
    const response = await api.post('/api/goals', payload);
    return response.data;
  },

  getGoalsForSession: async (sessionId) => {
    const response = await api.get(`/api/goals/session/${sessionId}`);
    return response.data;
  },

  markOutcome: async (id, achievedMinutes) => {
    const response = await api.put(`/api/goals/${id}/outcome`, { achievedMinutes });
    return response.data;
  },

  getCompletionRate: async () => {
    const response = await api.get('/api/goals/completion-rate');
    return response.data;
  },
};

export default sessionGoalService;
