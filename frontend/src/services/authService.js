import api from './api';

const authService = {
  login: async (credentials) => {
    const payload = {
      email: credentials.email || credentials.username,
      username: credentials.username || credentials.email,
      password: credentials.password,
    };
    const response = await api.post('/auth/login', payload);
    const data = response.data || {};

    const token = data.token || data.jwt || data.accessToken || data.bearerToken;
    const role = data.role || (data.user && data.user.role);
    const userId = data.userId || (data.user && data.user.userId) || (data.user && data.user.id) || data.id;
    const organizationId = data.organizationId || (data.user && data.user.organizationId);

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('jwt', token);
      localStorage.setItem('accessToken', token);
      localStorage.setItem('flowstate_access_token', token);
    }
    if (role) {
      localStorage.setItem('role', role);
      localStorage.setItem('flowstate_role', role);
    }
    if (userId) {
      localStorage.setItem('userId', String(userId));
      localStorage.setItem('flowstate_user_id', String(userId));
    }
    if (organizationId) {
      localStorage.setItem('organizationId', String(organizationId));
    }

    return data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('jwt');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('organizationId');
      localStorage.removeItem('flowstate_access_token');
      localStorage.removeItem('flowstate_refresh_token');
      localStorage.removeItem('flowstate_user_id');
      localStorage.removeItem('flowstate_username');
      localStorage.removeItem('flowstate_full_name');
      localStorage.removeItem('flowstate_role');
    }
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export default authService;
