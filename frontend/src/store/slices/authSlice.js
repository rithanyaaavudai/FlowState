import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const token =
  localStorage.getItem('token') ||
  localStorage.getItem('jwt') ||
  localStorage.getItem('accessToken') ||
  localStorage.getItem('flowstate_access_token');
const role = localStorage.getItem('role') || localStorage.getItem('flowstate_role');
const userId = localStorage.getItem('userId') || localStorage.getItem('flowstate_user_id');
const organizationId = localStorage.getItem('organizationId');
const username = localStorage.getItem('flowstate_username');
const fullName = localStorage.getItem('flowstate_full_name');

const initialState = {
  userId: userId || null,
  role: role || null,
  organizationId: organizationId || null,
  isAuthenticated: !!token,
  token: token || null,
  username: username || null,
  fullName: fullName || null,
  user: token ? { userId, role, organizationId, token, username, fullName } : null,
  status: 'idle',
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

const handleAuthSuccess = (state, payload) => {
  const data = payload?.data || payload || {};
  const tokenVal =
    data.token ||
    data.jwt ||
    data.accessToken ||
    data.bearerToken ||
    state.token ||
    '';
  const userObj = data.user || data;
  const roleVal = data.role || userObj.role || null;
  const userIdVal =
    data.userId ||
    userObj.userId ||
    userObj.id ||
    data.id ||
    state.userId ||
    null;
  const orgIdVal =
    data.organizationId ||
    userObj.organizationId ||
    state.organizationId ||
    null;
  const usernameVal = data.username || userObj.username || '';
  const fullNameVal =
    data.fullName || userObj.fullName || userObj.name || usernameVal || '';

  state.isAuthenticated = true;
  state.userId = userIdVal;
  state.role = roleVal;
  state.organizationId = orgIdVal;
  state.token = tokenVal || state.token;
  state.username = usernameVal;
  state.fullName = fullNameVal;
  state.user = {
    userId: userIdVal,
    id: userIdVal,
    role: roleVal,
    organizationId: orgIdVal,
    token: state.token,
    accessToken: state.token,
    username: usernameVal,
    fullName: fullNameVal,
    name: fullNameVal,
    ...(typeof userObj === 'object' ? userObj : {}),
  };
  state.loading = false;
  state.status = 'succeeded';
  state.error = null;

  if (state.token) {
    localStorage.setItem('token', state.token);
    localStorage.setItem('jwt', state.token);
    localStorage.setItem('flowstate_access_token', state.token);
  }
  if (roleVal) {
    localStorage.setItem('role', roleVal);
    localStorage.setItem('flowstate_role', roleVal);
  }
  if (userIdVal) {
    localStorage.setItem('userId', String(userIdVal));
    localStorage.setItem('flowstate_user_id', String(userIdVal));
  }
  if (orgIdVal) {
    localStorage.setItem('organizationId', String(orgIdVal));
  }
  if (usernameVal) localStorage.setItem('flowstate_username', usernameVal);
  if (fullNameVal) localStorage.setItem('flowstate_full_name', fullNameVal);
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      handleAuthSuccess(state, action.payload);
    },
    logout: (state) => {
      state.userId = null;
      state.role = null;
      state.organizationId = null;
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.username = null;
      state.fullName = null;
      state.error = null;
      state.loading = false;
      state.status = 'idle';

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
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      handleAuthSuccess(state, action.payload);
    },
    setUser: (state, action) => {
      handleAuthSuccess(state, action.payload);
    },
    setAuth: (state, action) => {
      handleAuthSuccess(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        handleAuthSuccess(state, action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload || action.error?.message || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        handleAuthSuccess(state, action.payload);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload || action.error?.message || 'Registration failed';
      })
      .addMatcher(
        (action) => action.type === 'auth/login/fulfilled',
        (state, action) => {
          handleAuthSuccess(state, action.payload);
        }
      );
  },
});

export const {
  loginSuccess,
  logout,
  clearAuthError,
  setCredentials,
  setUser,
  setAuth,
} = authSlice.actions;

export default authSlice.reducer;
