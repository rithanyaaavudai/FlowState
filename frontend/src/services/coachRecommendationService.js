import api from './api';

export const coachRecommendationService = {
  issue: async (payload) => {
    const response = await api.post('/api/recommendations', payload);
    return response.data;
  },

  getForPractitioner: async (practitionerId, params) => {
    const response = await api.get(`/api/recommendations/practitioner/${practitionerId}`, { params });
    return response.data;
  },

  getMinePending: async () => {
    const response = await api.get('/api/recommendations/mine/pending');
    return response.data;
  },

  getMineIssued: async (params) => {
    const response = await api.get('/api/recommendations/mine/issued', { params });
    return response.data;
  },

  acknowledge: async (id) => {
    const response = await api.put(`/api/recommendations/${id}/acknowledge`);
    return response.data;
  },

  dismiss: async (id) => {
    const response = await api.put(`/api/recommendations/${id}/dismiss`);
    return response.data;
  },
};

export default coachRecommendationService;
