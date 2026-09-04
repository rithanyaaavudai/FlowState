import api from './api';

const accountService = {
  getAccounts: async () => {
    const response = await api.get('/accounts');
    return response.data;
  },

  createAccount: async (data) => {
    const response = await api.post('/accounts', data);
    return response.data;
  },
};

export default accountService;
