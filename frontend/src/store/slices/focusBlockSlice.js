import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import focusBlockService from '../../services/focusBlockService';

const initialState = {
  items: [],
  capacityPlan: [],
  loading: false,
  error: null,
};

export const registerBlock = createAsyncThunk(
  'focusBlocks/registerBlock',
  async (payload, { rejectWithValue }) => {
    try {
      return await focusBlockService.register(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to register block');
    }
  }
);

export const fetchMineBlocks = createAsyncThunk(
  'focusBlocks/fetchMineBlocks',
  async (_, { rejectWithValue }) => {
    try {
      return await focusBlockService.getMine();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch focus blocks');
    }
  }
);

export const fetchCapacityPlan = createAsyncThunk(
  'focusBlocks/fetchCapacityPlan',
  async (_, { rejectWithValue }) => {
    try {
      return await focusBlockService.getCapacityPlan();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch capacity plan');
    }
  }
);

export const protectBlock = createAsyncThunk(
  'focusBlocks/protectBlock',
  async (id, { rejectWithValue }) => {
    try {
      return await focusBlockService.protect(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to protect block');
    }
  }
);

export const unprotectBlock = createAsyncThunk(
  'focusBlocks/unprotectBlock',
  async (id, { rejectWithValue }) => {
    try {
      return await focusBlockService.unprotect(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to unprotect block');
    }
  }
);

export const deleteBlock = createAsyncThunk(
  'focusBlocks/deleteBlock',
  async (id, { rejectWithValue }) => {
    try {
      await focusBlockService.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete block');
    }
  }
);

const upsertBlock = (items, block) => {
  if (!block || !block.id) return;
  const idx = items.findIndex((b) => b.id === block.id);
  if (idx !== -1) {
    items[idx] = block;
  } else {
    items.push(block);
  }
};

const focusBlockSlice = createSlice({
  name: 'focusBlocks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerBlock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerBlock.fulfilled, (state, action) => {
        state.loading = false;
        upsertBlock(state.items, action.payload);
      })
      .addCase(registerBlock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMineBlocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMineBlocks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchMineBlocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCapacityPlan.fulfilled, (state, action) => {
        state.capacityPlan = action.payload || [];
      })
      .addCase(protectBlock.fulfilled, (state, action) => {
        upsertBlock(state.items, action.payload);
      })
      .addCase(unprotectBlock.fulfilled, (state, action) => {
        upsertBlock(state.items, action.payload);
      })
      .addCase(deleteBlock.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b.id !== action.payload);
      });
  },
});

export const { clearError } = focusBlockSlice.actions;
export default focusBlockSlice.reducer;
