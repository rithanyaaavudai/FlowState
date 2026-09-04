import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('flowstate_access_token') ||
      localStorage.getItem('token');
    if (token && token.trim() !== '') {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('flowstate_access_token');
      localStorage.removeItem('flowstate_refresh_token');
      localStorage.removeItem('flowstate_user_id');
      localStorage.removeItem('flowstate_username');
      localStorage.removeItem('flowstate_full_name');
      localStorage.removeItem('flowstate_role');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
