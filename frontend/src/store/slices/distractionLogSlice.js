import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import distractionLogService from '../../services/distractionLogService';

const initialState = {
  logs: [],
  breakdown: [],
  trend: [],
  loading: false,
  error: null,
};

export const logDistraction = createAsyncThunk(
  'distractionLogs/logDistraction',
  async (payload, { rejectWithValue }) => {
    try {
      return await distractionLogService.logDistraction(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to log distraction');
    }
  }
);

export const fetchLogsForSession = createAsyncThunk(
  'distractionLogs/fetchLogsForSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await distractionLogService.getLogsForSession(sessionId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch distraction logs');
    }
  }
);

export const fetchBreakdown = createAsyncThunk(
  'distractionLogs/fetchBreakdown',
  async (_, { rejectWithValue }) => {
    try {
      return await distractionLogService.getBreakdown();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch breakdown');
    }
  }
);

export const fetchTrend = createAsyncThunk(
  'distractionLogs/fetchTrend',
  async (_, { rejectWithValue }) => {
    try {
      return await distractionLogService.getTrend();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch trend');
    }
  }
);

const distractionLogSlice = createSlice({
  name: 'distractionLogs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logDistraction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logDistraction.fulfilled, (state, action) => {
        state.loading = false;
        state.logs.unshift(action.payload);
      })
      .addCase(logDistraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLogsForSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLogsForSession.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchLogsForSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBreakdown.fulfilled, (state, action) => {
        state.breakdown = action.payload;
      })
      .addCase(fetchTrend.fulfilled, (state, action) => {
        state.trend = action.payload;
      });
  },
});

export const { clearError } = distractionLogSlice.actions;
export default distractionLogSlice.reducer;
