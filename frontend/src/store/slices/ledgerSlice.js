import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ledgerService from '../../services/ledgerService';

const initialState = {
  list: [],
  selectedLedgerId: null,
  status: 'idle',
  error: null,
};

export const fetchLedgers = createAsyncThunk(
  'ledgers/fetchLedgers',
  async (params, { rejectWithValue }) => {
    try {
      const data = await ledgerService.getLedgers(params);
      return Array.isArray(data) ? data : data?.content || [];
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch ledgers';
      return rejectWithValue(message);
    }
  }
);

export const createLedger = createAsyncThunk(
  'ledgers/createLedger',
  async (ledgerData, { rejectWithValue }) => {
    try {
      const data = await ledgerService.createLedger(ledgerData);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to create ledger';
      return rejectWithValue(message);
    }
  }
);

const ledgerSlice = createSlice({
  name: 'ledgers',
  initialState,
  reducers: {
    setSelectedLedger: (state, action) => {
      state.selectedLedgerId = action.payload;
    },
    clearLedgerError: (state) => {
      state.error = null;
    },
    setLedgers: (state, action) => {
      state.list = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.content || [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLedgers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLedgers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
        state.error = null;
      })
      .addCase(fetchLedgers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createLedger.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createLedger.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.list.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createLedger.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setSelectedLedger, clearLedgerError, setLedgers } =
  ledgerSlice.actions;
export default ledgerSlice.reducer;
