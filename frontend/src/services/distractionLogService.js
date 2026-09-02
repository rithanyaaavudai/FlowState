import api from './api';

export const distractionLogService = {
  logDistraction: async (payload) => {
    const response = await api.post('/api/distractions', payload);
    return response.data;
  },

  getLogsForSession: async (sessionId) => {
    const response = await api.get(`/api/distractions/${sessionId}`);
    return response.data;
  },

  getBreakdown: async () => {
    const response = await api.get('/api/distractions/breakdown');
    return response.data;
  },

  getTrend: async () => {
    const response = await api.get('/api/distractions/trend');
    return response.data;
  },

  getAll: async (params) => {
    const response = await api.get('/api/distractions', { params });
    return response.data;
  },
};

export default distractionLogService;
