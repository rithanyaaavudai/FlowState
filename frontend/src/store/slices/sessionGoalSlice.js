import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sessionGoalService from '../../services/sessionGoalService';

const initialState = {
  items: [],
  loading: false,
  error: null,
  completionRate: null,
};

export const attachGoal = createAsyncThunk(
  'sessionGoals/attachGoal',
  async (payload, { rejectWithValue }) => {
    try {
      return await sessionGoalService.attachGoal(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to attach goal');
    }
  }
);

export const fetchGoalsForSession = createAsyncThunk(
  'sessionGoals/fetchGoalsForSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await sessionGoalService.getGoalsForSession(sessionId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch goals');
    }
  }
);

export const markGoalOutcome = createAsyncThunk(
  'sessionGoals/markGoalOutcome',
  async ({ id, achievedMinutes }, { rejectWithValue }) => {
    try {
      return await sessionGoalService.markOutcome(id, achievedMinutes);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to mark goal outcome');
    }
  }
);

export const fetchCompletionRate = createAsyncThunk(
  'sessionGoals/fetchCompletionRate',
  async (_, { rejectWithValue }) => {
    try {
      return await sessionGoalService.getCompletionRate();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch completion rate');
    }
  }
);

const sessionGoalSlice = createSlice({
  name: 'sessionGoals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(attachGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(attachGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(attachGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchGoalsForSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoalsForSession.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGoalsForSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markGoalOutcome.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex((g) => g.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(fetchCompletionRate.fulfilled, (state, action) => {
        state.completionRate = action.payload;
      });
  },
});

export const { clearError } = sessionGoalSlice.actions;
export default sessionGoalSlice.reducer;
