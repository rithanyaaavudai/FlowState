import api from './api';

const ledgerService = {
  getLedgers: async (params) => {
    const response = await api.get('/ledgers', { params });
    return response.data;
  },

  createLedger: async (data) => {
    const response = await api.post('/ledgers', data);
    return response.data;
  },
};

export default ledgerService;
