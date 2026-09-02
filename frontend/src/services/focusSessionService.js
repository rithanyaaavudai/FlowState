import api from './api';

export const focusSessionService = {
  getAll: async (params) => {
    const response = await api.get('/api/sessions', { params });
    return response.data;
  },

  getMine: async (params) => {
    const response = await api.get('/api/sessions/mine', { params });
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post('/api/sessions', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await api.put(`/api/sessions/${id}`, payload);
    return response.data;
  },

  start: async (id) => {
    const response = await api.put(`/api/sessions/${id}/start`);
    return response.data;
  },

  complete: async (id) => {
    const response = await api.put(`/api/sessions/${id}/complete`);
    return response.data;
  },

  abandon: async (id, reason) => {
    const response = await api.put(`/api/sessions/${id}/abandon`, { reason });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/sessions/${id}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/sessions/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/sessions/stats');
    return response.data;
  },
};

export default focusSessionService;
