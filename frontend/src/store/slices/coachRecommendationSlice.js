import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import coachRecommendationService from '../../services/coachRecommendationService';

const initialState = {
  items: [],
  pending: [],
  loading: false,
  error: null,
};

export const issueRecommendation = createAsyncThunk(
  'coachRecommendations/issueRecommendation',
  async (payload, { rejectWithValue }) => {
    try {
      return await coachRecommendationService.issue(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to issue recommendation');
    }
  }
);

export const fetchForPractitioner = createAsyncThunk(
  'coachRecommendations/fetchForPractitioner',
  async ({ practitionerId, params }, { rejectWithValue }) => {
    try {
      return await coachRecommendationService.getForPractitioner(practitionerId, params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch recommendations');
    }
  }
);

export const fetchMinePending = createAsyncThunk(
  'coachRecommendations/fetchMinePending',
  async (_, { rejectWithValue }) => {
    try {
      return await coachRecommendationService.getMinePending();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch pending recommendations');
    }
  }
);

export const fetchMineIssued = createAsyncThunk(
  'coachRecommendations/fetchMineIssued',
  async (params, { rejectWithValue }) => {
    try {
      return await coachRecommendationService.getMineIssued(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch issued recommendations');
    }
  }
);

export const acknowledgeRecommendation = createAsyncThunk(
  'coachRecommendations/acknowledgeRecommendation',
  async (id, { rejectWithValue }) => {
    try {
      return await coachRecommendationService.acknowledge(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to acknowledge recommendation');
    }
  }
);

export const dismissRecommendation = createAsyncThunk(
  'coachRecommendations/dismissRecommendation',
  async (id, { rejectWithValue }) => {
    try {
      return await coachRecommendationService.dismiss(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to dismiss recommendation');
    }
  }
);

const coachRecommendationSlice = createSlice({
  name: 'coachRecommendations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(issueRecommendation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(issueRecommendation.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(issueRecommendation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchForPractitioner.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.content || action.payload || [];
      })
      .addCase(fetchMinePending.fulfilled, (state, action) => {
        state.loading = false;
        state.pending = action.payload || [];
      })
      .addCase(fetchMineIssued.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.content || action.payload || [];
      })
      .addCase(acknowledgeRecommendation.fulfilled, (state, action) => {
        state.pending = state.pending.filter((rec) => rec.id !== action.payload.id);
        const idx = state.items.findIndex((rec) => rec.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(dismissRecommendation.fulfilled, (state, action) => {
        state.pending = state.pending.filter((rec) => rec.id !== action.payload.id);
        const idx = state.items.findIndex((rec) => rec.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export const { clearError } = coachRecommendationSlice.actions;
export default coachRecommendationSlice.reducer;
