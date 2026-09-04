import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../../services/transactionService';

const initialState = {
  list: [],
  status: 'idle',
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (ledgerId, { rejectWithValue }) => {
    try {
      let data;
      if (ledgerId) {
        data = await transactionService.getByLedger(ledgerId);
      } else {
        data = await transactionService.getAllTransactions();
      }
      return Array.isArray(data) ? data : data?.content || [];
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch transactions';
      return rejectWithValue(message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const data = await transactionService.createTransaction(transactionData);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to create transaction';
      return rejectWithValue(message);
    }
  }
);

export const approveTransaction = createAsyncThunk(
  'transactions/approveTransaction',
  async (id, { rejectWithValue }) => {
    try {
      const data = await transactionService.approveTransaction(id);
      return { id, data };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to approve transaction';
      return rejectWithValue(message);
    }
  }
);

export const reverseTransaction = createAsyncThunk(
  'transactions/reverseTransaction',
  async (id, { rejectWithValue }) => {
    try {
      const data = await transactionService.reverseTransaction(id);
      return { id, data };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to reverse transaction';
      return rejectWithValue(message);
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },
    setTransactions: (state, action) => {
      state.list = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.content || [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createTransaction.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.list.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(approveTransaction.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (t) => String(t.id) === String(action.payload.id)
        );
        if (index !== -1) {
          state.list[index] = {
            ...state.list[index],
            status: 'APPROVED',
            ...(action.payload.data && typeof action.payload.data === 'object'
              ? action.payload.data
              : {}),
          };
        }
      })
      .addCase(reverseTransaction.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (t) => String(t.id) === String(action.payload.id)
        );
        if (index !== -1) {
          state.list[index] = {
            ...state.list[index],
            status: 'REVERSED',
            ...(action.payload.data && typeof action.payload.data === 'object'
              ? action.payload.data
              : {}),
          };
        }
      });
  },
});

export const { clearTransactionError, setTransactions } =
  transactionSlice.actions;
export default transactionSlice.reducer;
