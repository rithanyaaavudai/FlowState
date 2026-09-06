import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const token = localStorage.getItem('flowstate_access_token') || localStorage.getItem('token') || null;
const userId = localStorage.getItem('flowstate_user_id') || localStorage.getItem('userId') || null;
const username = localStorage.getItem('flowstate_username') || null;
const fullName = localStorage.getItem('flowstate_full_name') || null;
const role = localStorage.getItem('flowstate_role') || localStorage.getItem('role') || null;

const initialState = {
  token,
  userId,
  username,
  fullName,
  role,
  user: token ? { token, accessToken: token, userId, username, fullName, role } : null,
  isAuthenticated: !!token,
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

const saveAuthToStorageAndState = (state, payload) => {
  const data = payload?.data || payload || {};
  const tokenVal =
    data.accessToken ||
    data.token ||
    data.jwt ||
    data.bearerToken ||
    state.token ||
    '';
  const userObj = data.user || data;
  const roleVal = data.role || userObj.role || state.role || null;
  const userIdVal =
    data.userId !== undefined && data.userId !== null
      ? data.userId
      : userObj.userId !== undefined && userObj.userId !== null
      ? userObj.userId
      : userObj.id !== undefined && userObj.id !== null
      ? userObj.id
      : data.id !== undefined && data.id !== null
      ? data.id
      : state.userId || null;
  const usernameVal = data.username || userObj.username || state.username || '';
  const fullNameVal =
    data.fullName ||
    userObj.fullName ||
    userObj.name ||
    state.fullName ||
    usernameVal ||
    '';
  const refreshTokenVal = data.refreshToken || userObj.refreshToken || '';

  state.isAuthenticated = true;
  state.token = tokenVal;
  state.userId = userIdVal;
  state.role = roleVal;
  state.username = usernameVal;
  state.fullName = fullNameVal;
  state.user = {
    token: tokenVal,
    accessToken: tokenVal,
    userId: userIdVal,
    id: userIdVal,
    username: usernameVal,
    fullName: fullNameVal,
    name: fullNameVal,
    role: roleVal,
    refreshToken: refreshTokenVal,
    ...(typeof userObj === 'object' ? userObj : {}),
  };
  state.loading = false;
  state.error = null;

  if (tokenVal) localStorage.setItem('flowstate_access_token', tokenVal);
  if (refreshTokenVal) localStorage.setItem('flowstate_refresh_token', refreshTokenVal);
  if (userIdVal !== null && userIdVal !== undefined)
    localStorage.setItem('flowstate_user_id', String(userIdVal));
  if (usernameVal) localStorage.setItem('flowstate_username', usernameVal);
  if (fullNameVal) localStorage.setItem('flowstate_full_name', fullNameVal);
  if (roleVal) localStorage.setItem('flowstate_role', roleVal);
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
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;

      localStorage.removeItem('flowstate_access_token');
      localStorage.removeItem('flowstate_refresh_token');
      localStorage.removeItem('flowstate_user_id');
      localStorage.removeItem('flowstate_username');
      localStorage.removeItem('flowstate_full_name');
      localStorage.removeItem('flowstate_role');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    loginSuccess: (state, action) => {
      saveAuthToStorageAndState(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        saveAuthToStorageAndState(state, action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Registration failed';
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && (
          (typeof action.payload === 'string' && (action.payload.includes('401') || action.payload.toLowerCase().includes('unauthorized'))) ||
          (action.error?.message && (action.error.message.includes('401') || action.error.message.toLowerCase().includes('unauthorized')))
        ),
        (state) => {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem('flowstate_access_token');
        }
      );
  },
});

export const { logout, clearAuthError, loginSuccess } = authSlice.actions;
export default authSlice.reducer;
