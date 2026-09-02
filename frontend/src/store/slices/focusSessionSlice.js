import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import focusSessionService from '../../services/focusSessionService';

const initialState = {
  items: [],
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  stats: null,
  filterByStatus: '',
  searchQuery: '',
  loading: false,
  error: null,
};

export const fetchMySessions = createAsyncThunk(
  'focusSessions/fetchMySessions',
  async (params, { rejectWithValue }) => {
    try {
      return await focusSessionService.getMine(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch sessions');
    }
  }
);

export const fetchAllSessions = createAsyncThunk(
  'focusSessions/fetchAllSessions',
  async (params, { rejectWithValue }) => {
    try {
      return await focusSessionService.getAll(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch all sessions');
    }
  }
);

export const createSession = createAsyncThunk(
  'focusSessions/createSession',
  async (payload, { rejectWithValue }) => {
    try {
      return await focusSessionService.create(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create session');
    }
  }
);

export const updateSession = createAsyncThunk(
  'focusSessions/updateSession',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      return await focusSessionService.update(id, payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update session');
    }
  }
);

export const startSession = createAsyncThunk(
  'focusSessions/startSession',
  async (id, { rejectWithValue }) => {
    try {
      return await focusSessionService.start(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to start session');
    }
  }
);

export const completeSession = createAsyncThunk(
  'focusSessions/completeSession',
  async (id, { rejectWithValue }) => {
    try {
      return await focusSessionService.complete(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to complete session');
    }
  }
);

export const abandonSession = createAsyncThunk(
  'focusSessions/abandonSession',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      return await focusSessionService.abandon(id, reason);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to abandon session');
    }
  }
);

export const deleteSession = createAsyncThunk(
  'focusSessions/deleteSession',
  async (id, { rejectWithValue }) => {
    try {
      await focusSessionService.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete session');
    }
  }
);

export const fetchStats = createAsyncThunk(
  'focusSessions/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await focusSessionService.getStats();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch stats');
    }
  }
);

const upsertItem = (items, newItem) => {
  if (!newItem || typeof newItem !== 'object') return;
  const itemId = newItem.id || newItem.sessionId;
  if (!itemId) return;
  const idx = items.findIndex((it) => (it.id || it.sessionId) === itemId);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...newItem };
  } else {
    items.unshift(newItem);
  }
};

const handleFetchFulfilled = (state, action) => {
  state.loading = false;
  state.error = null;
  const data = action.payload;
  if (data && Array.isArray(data.content)) {
    state.items = data.content;
    state.totalPages = data.totalPages || 1;
    state.totalElements = data.totalElements || data.content.length;
    state.currentPage = typeof data.number === 'number' ? data.number : 0;
  } else if (Array.isArray(data)) {
    state.items = data;
    state.totalPages = 1;
    state.totalElements = data.length;
    state.currentPage = 0;
  } else {
    state.items = [];
  }
};

const focusSessionSlice = createSlice({
  name: 'focusSessions',
  initialState,
  reducers: {
    setFilterByStatus: (state, action) => {
      state.filterByStatus = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySessions.fulfilled, handleFetchFulfilled)
      .addCase(fetchMySessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSessions.fulfilled, handleFetchFulfilled)
      .addCase(fetchAllSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
        upsertItem(state.items, action.payload);
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        state.loading = false;
        upsertItem(state.items, action.payload);
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(startSession.fulfilled, (state, action) => {
        state.loading = false;
        upsertItem(state.items, action.payload);
      })
      .addCase(startSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(completeSession.fulfilled, (state, action) => {
        state.loading = false;
        upsertItem(state.items, action.payload);
      })
      .addCase(completeSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(abandonSession.fulfilled, (state, action) => {
        state.loading = false;
        upsertItem(state.items, action.payload);
      })
      .addCase(abandonSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (item) => (item.id || item.sessionId) !== action.payload
        );
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { setFilterByStatus, setSearchQuery, clearError } = focusSessionSlice.actions;
export default focusSessionSlice.reducer;
