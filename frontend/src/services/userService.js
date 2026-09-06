import api from './api';

const userService = {
  getAllUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data || [];
  },

  getUserById: async (id) => {
    const response = await api.get(`/api/admin/users/${id}`);
    return response.data || {};
  },

  createUser: async (userData) => {
    const response = await api.post('/api/admin/users', userData);
    return response.data || {};
  },

  updateUserRole: async (id, role) => {
    const response = await api.put(`/api/admin/users/${id}/role`, { role });
    return response.data || {};
  },

  toggleUserStatus: async (id) => {
    const response = await api.put(`/api/admin/users/${id}/status`);
    return response.data || {};
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/api/admin/users/${id}`);
    return response.data || {};
  },
};

export default userService;
