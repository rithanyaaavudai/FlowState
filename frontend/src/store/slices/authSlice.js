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

const handleAuthFulfilled = (state, action) => {
  state.loading = false;
  state.error = null;
  const res = action.payload || {};
  const tokenVal = res.accessToken || res.token || '';
  const refreshTokenVal = res.refreshToken || '';
  const userIdVal = res.userId || res.id || '';
  const usernameVal = res.username || '';
  const fullNameVal = res.fullName || res.name || res.username || '';
  const roleVal = res.role || '';

  state.token = tokenVal;
  state.userId = String(userIdVal);
  state.username = usernameVal;
  state.fullName = fullNameVal;
  state.role = roleVal;
  state.user = {
    userId: String(userIdVal),
    username: usernameVal,
    fullName: fullNameVal,
    role: roleVal,
  };

  if (tokenVal) localStorage.setItem('flowstate_access_token', tokenVal);
  if (refreshTokenVal) localStorage.setItem('flowstate_refresh_token', refreshTokenVal);
  if (userIdVal) localStorage.setItem('flowstate_user_id', String(userIdVal));
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
      state.error = null;
      clearStorage();
    },
    clearAuthError: (state) => {
      state.error = null;
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
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, handleAuthFulfilled)
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
