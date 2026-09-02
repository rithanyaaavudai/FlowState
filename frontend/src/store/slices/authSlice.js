import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const CLEAR_KEYS = [
  'flowstate_access_token',
  'flowstate_refresh_token',
  'flowstate_user_id',
  'flowstate_username',
  'flowstate_full_name',
  'flowstate_role',
];

const clearStorage = () => {
  CLEAR_KEYS.forEach((key) => localStorage.removeItem(key));
};

const token = localStorage.getItem('flowstate_access_token');
const userId = localStorage.getItem('flowstate_user_id');
const username = localStorage.getItem('flowstate_username');
const fullName = localStorage.getItem('flowstate_full_name');
const role = localStorage.getItem('flowstate_role');

const initialState = {
  token: token || null,
  userId: userId || null,
  username: username || null,
  fullName: fullName || null,
  role: role || null,
  user: token ? { userId, username, fullName, role } : null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed';
      return rejectWithValue(message);
    }
  }
);

const parseAuthPayload = (payload) => {
  if (!payload) return {};
  const res = payload.data || payload;
  const tokenVal = res.accessToken || res.token || res.jwt || res.bearerToken || '';
  const refreshTokenVal = res.refreshToken || '';

  const userObj = res.user || res;
  const userIdVal = userObj.userId || userObj.id || res.userId || res.id || '';
  const usernameVal = userObj.username || res.username || '';
  const fullNameVal =
    userObj.fullName || userObj.name || userObj.username || res.fullName || res.name || res.username || '';
  const roleVal = userObj.role || res.role || '';

  const formattedUser = {
    userId: String(userIdVal),
    id: String(userIdVal),
    username: usernameVal,
    fullName: fullNameVal,
    name: fullNameVal,
    role: roleVal,
    token: tokenVal,
    accessToken: tokenVal,
    ...(typeof userObj === 'object' ? userObj : {}),
  };
  formattedUser.token = tokenVal;
  formattedUser.accessToken = tokenVal;

  return {
    token: tokenVal,
    refreshToken: refreshTokenVal,
    userId: String(userIdVal),
    username: usernameVal,
    fullName: fullNameVal,
    role: roleVal,
    user: formattedUser,
  };
};

const handleAuthFulfilled = (state, action) => {
  state.loading = false;
  state.error = null;
  const parsed = parseAuthPayload(action.payload);

  if (parsed.token) state.token = parsed.token;
  state.userId = parsed.userId;
  state.username = parsed.username;
  state.fullName = parsed.fullName;
  state.role = parsed.role;
  state.user = parsed.user;

  if (parsed.token) localStorage.setItem('flowstate_access_token', parsed.token);
  if (parsed.refreshToken) localStorage.setItem('flowstate_refresh_token', parsed.refreshToken);
  if (parsed.userId) localStorage.setItem('flowstate_user_id', parsed.userId);
  if (parsed.username) localStorage.setItem('flowstate_username', parsed.username);
  if (parsed.fullName) localStorage.setItem('flowstate_full_name', parsed.fullName);
  if (parsed.role) localStorage.setItem('flowstate_role', parsed.role);
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.userId = null;
      state.username = null;
      state.fullName = null;
      state.role = null;
      state.error = null;
      clearStorage();
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      handleAuthFulfilled(state, action);
    },
    setUser: (state, action) => {
      handleAuthFulfilled(state, action);
    },
    setAuth: (state, action) => {
      handleAuthFulfilled(state, action);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, handleAuthFulfilled)
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, handleAuthFulfilled)
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Registration failed';
      })
      .addMatcher(
        (action) =>
          action.type.endsWith('/rejected') &&
          typeof action.payload === 'string' &&
          (action.payload.includes('Unauthorized') || action.payload.includes('401')),
        (state) => {
          state.user = null;
          state.token = null;
          state.userId = null;
          state.username = null;
          state.fullName = null;
          state.role = null;
          clearStorage();
        }
      );
  },
});

export const { logout, clearAuthError, setCredentials, setUser, setAuth } = authSlice.actions;
export default authSlice.reducer;

