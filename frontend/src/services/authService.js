import api from './api';

const authService = {
  login: async (credentials) => {
    const payload = {
      username: credentials.username || credentials.email,
      password: credentials.password,
      ...(credentials.email && { email: credentials.email }),
    };
    const response = await api.post('/api/auth/login', payload);
    const data = response.data || {};

    const token = data.accessToken || data.token || data.jwt;
    const refreshToken = data.refreshToken;
    const role = data.role || data.user?.role;
    const userId = data.userId || data.user?.userId || data.user?.id || data.id;
    const username = data.username || data.user?.username;
    const fullName = data.fullName || data.user?.fullName || data.user?.name;

    if (token) {
      localStorage.setItem('flowstate_access_token', token);
    }
    if (refreshToken) {
      localStorage.setItem('flowstate_refresh_token', refreshToken);
    }
    if (userId !== undefined && userId !== null) {
      localStorage.setItem('flowstate_user_id', String(userId));
    }
    if (username) {
      localStorage.setItem('flowstate_username', username);
    }
    if (fullName) {
      localStorage.setItem('flowstate_full_name', fullName);
    }
    if (role) {
      localStorage.setItem('flowstate_role', role);
    }

    return data;
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data || {};
  },

  refresh: async (refreshToken) => {
    const token = refreshToken || localStorage.getItem('flowstate_refresh_token');
    const response = await api.post('/api/auth/refresh', { refreshToken: token });
    const data = response.data || {};

    if (data.accessToken) {
      localStorage.setItem('flowstate_access_token', data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem('flowstate_refresh_token', data.refreshToken);
    }

    return data;
  },

  logout: async () => {
    localStorage.removeItem('flowstate_access_token');
    localStorage.removeItem('flowstate_refresh_token');
    localStorage.removeItem('flowstate_user_id');
    localStorage.removeItem('flowstate_username');
    localStorage.removeItem('flowstate_full_name');
    localStorage.removeItem('flowstate_role');
  },
};

export default authService;
