import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export const CLEAR_KEYS = [
  'flowstate_access_token',
  'flowstate_refresh_token',
  'flowstate_user_id',
  'flowstate_username',
  'flowstate_full_name',
  'flowstate_role',
];

export const clearAuthStorage = () => {
  CLEAR_KEYS.forEach((key) => localStorage.removeItem(key));
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flowstate_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuthStorage();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
