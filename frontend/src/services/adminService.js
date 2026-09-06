import api from './api';

export const adminService = {
  // Overview & Analytics
  getOverview: async (period = 'all') => {
    const response = await api.get(`/api/admin/overview?period=${encodeURIComponent(period)}`);
    return response.data;
  },

  // Sessions
  getAllSessions: async (params = {}) => {
    const { search = '', status = '', page = 0, size = 10 } = params;
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (status && status !== 'ALL') queryParams.append('status', status);
    queryParams.append('page', page);
    queryParams.append('size', size);
    const response = await api.get(`/api/sessions?${queryParams.toString()}`);
    return response.data;
  },

  getSessionDetails: async (sessionId) => {
    const response = await api.get(`/api/sessions/${sessionId}`);
    return response.data;
  },

  getSessionGoals: async (sessionId) => {
    const response = await api.get(`/api/goals/session/${sessionId}`);
    return response.data;
  },

  getSessionDistractions: async (sessionId) => {
    const response = await api.get(`/api/distractions/session/${sessionId}`);
    return response.data;
  },

  // Distraction Analytics & Logs
  getDistractionBreakdown: async (practitionerId = null) => {
    const url = practitionerId
      ? `/api/distractions/practitioner/${practitionerId}/breakdown`
      : '/api/distractions/platform/breakdown';
    const response = await api.get(url);
    return response.data;
  },

  getDistractionTrend: async (practitionerId = null) => {
    const url = practitionerId
      ? `/api/distractions/practitioner/${practitionerId}/trend`
      : '/api/distractions/platform/trend';
    const response = await api.get(url);
    return response.data;
  },

  getDistractionLogs: async (page = 0, size = 10) => {
    const response = await api.get(`/api/distractions?page=${page}&size=${size}`);
    return response.data;
  },

  // Focus Blocks
  getAllFocusBlocks: async () => {
    const response = await api.get('/api/blocks');
    return response.data;
  },

  deleteFocusBlock: async (blockId) => {
    const response = await api.delete(`/api/blocks/${blockId}`);
    return response.data;
  },

  // Recommendations
  getAllRecommendations: async (page = 0, size = 10) => {
    const response = await api.get(`/api/recommendations?page=${page}&size=${size}`);
    return response.data;
  },

  issueRecommendation: async (data) => {
    const response = await api.post('/api/recommendations', data);
    return response.data;
  },

  // Users
  getAllUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/api/admin/users', userData);
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/api/admin/users/${userId}/role`, { role });
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await api.put(`/api/admin/users/${userId}/status`);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
  },
};

export default adminService;
