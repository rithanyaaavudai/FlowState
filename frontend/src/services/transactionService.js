import api from './api';

const transactionService = {
  getAllTransactions: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },

  getByLedger: async (ledgerId) => {
    const response = await api.get('/transactions', { params: { ledgerId } });
    return response.data;
  },

  createTransaction: async (data) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  approveTransaction: async (id) => {
    const response = await api.put(`/transactions/${id}`, { status: 'APPROVED' });
    return response.data;
  },

  reverseTransaction: async (id) => {
    const response = await api.post(`/transactions/${id}/reverse`, { status: 'REVERSED' });
    return response.data;
  },
};

export default transactionService;
