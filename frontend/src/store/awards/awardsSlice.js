import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as awardsApi from '@/api/awardsApi';
import { REQUEST_STATUS } from '@/constants';
import { toRejectedPayload } from '@/utils/errorHandler';

const initialState = {
  items: [],
  status: REQUEST_STATUS.idle,
  error: null,
  mutationStatus: REQUEST_STATUS.idle,
  mutationError: null,
};

export const fetchAwards = createAsyncThunk(
  'awards/fetchAwards',
  async (_, { rejectWithValue }) => {
    try {
      const data = await awardsApi.fetchAwards();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

export const createAward = createAsyncThunk(
  'awards/createAward',
  async (payload, { rejectWithValue }) => {
    try {
      return await awardsApi.createAward(payload);
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

export const updateAward = createAsyncThunk(
  'awards/updateAward',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await awardsApi.updateAward(id, payload);
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

export const deleteAward = createAsyncThunk(
  'awards/deleteAward',
  async (id, { rejectWithValue }) => {
    try {
      await awardsApi.deleteAward(id);
      return id;
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

const awardsSlice = createSlice({
  name: 'awards',
  initialState,
  reducers: {
    clearAwardsError(state) {
      state.error = null;
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAwards.pending, (state) => {
        state.status = REQUEST_STATUS.loading;
        state.error = null;
      })
      .addCase(fetchAwards.fulfilled, (state, action) => {
        state.status = REQUEST_STATUS.succeeded;
        state.items = action.payload;
      })
      .addCase(fetchAwards.rejected, (state, action) => {
        state.status = REQUEST_STATUS.failed;
        state.error = action.payload?.message ?? 'Не вдалося завантажити нагороди.';
      })

      .addCase(createAward.pending, (state) => {
        state.mutationStatus = REQUEST_STATUS.loading;
        state.mutationError = null;
      })
      .addCase(createAward.fulfilled, (state, action) => {
        state.mutationStatus = REQUEST_STATUS.succeeded;
        state.items.push(action.payload);
      })
      .addCase(createAward.rejected, (state, action) => {
        state.mutationStatus = REQUEST_STATUS.failed;
        state.mutationError = action.payload?.message ?? 'Не вдалося створити нагороду.';
      })

      .addCase(updateAward.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateAward.rejected, (state, action) => {
        state.mutationError = action.payload?.message ?? 'Не вдалося оновити нагороду.';
      })

      .addCase(deleteAward.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteAward.rejected, (state, action) => {
        state.mutationError = action.payload?.message ?? 'Не вдалося видалити нагороду.';
      });
  },
});

export const { clearAwardsError } = awardsSlice.actions;

export default awardsSlice.reducer;
