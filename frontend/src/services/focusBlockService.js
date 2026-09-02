import api from './api';

export const focusBlockService = {
  register: async (payload) => {
    const response = await api.post('/api/blocks', payload);
    return response.data;
  },

  getMine: async () => {
    const response = await api.get('/api/blocks/mine');
    return response.data;
  },

  getCapacityPlan: async () => {
    const response = await api.get('/api/blocks/capacity-plan');
    return response.data;
  },

  protect: async (id) => {
    const response = await api.put(`/api/blocks/${id}/protect`);
    return response.data;
  },

  unprotect: async (id) => {
    const response = await api.put(`/api/blocks/${id}/unprotect`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/blocks/${id}`);
    return response.data;
  },
};

export default focusBlockService;
