import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import accountService from '../../services/accountService';

const initialState = {
  list: [],
  status: 'idle',
  error: null,
};

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await accountService.getAccounts();
      return Array.isArray(data) ? data : data?.content || [];
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch accounts';
      return rejectWithValue(message);
    }
  }
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (accountData, { rejectWithValue }) => {
    try {
      const data = await accountService.createAccount(accountData);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to create account';
      return rejectWithValue(message);
    }
  }
);

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearAccountError: (state) => {
      state.error = null;
    },
    setAccounts: (state, action) => {
      state.list = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.content || [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
        state.error = null;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createAccount.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.list.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearAccountError, setAccounts } = accountSlice.actions;
export default accountSlice.reducer;
