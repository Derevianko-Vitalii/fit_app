import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as usersApi from '@/api/usersApi';
import { REQUEST_STATUS } from '@/constants';
import { toRejectedPayload } from '@/utils/errorHandler';

const initialState = {
  /** Словник користувачів за id — використовується для підстановки авторів у стрічку. */
  entities: {},
  /** Порядок id, у якому їх повернув бекенд. */
  ids: [],
  total: 0,
  status: REQUEST_STATUS.idle,
  error: null,

  /** Профіль, який зараз відкритий на сторінці Account. */
  profile: null,
  profileStatus: REQUEST_STATUS.idle,
  profileError: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await usersApi.fetchUsers(params);

      return { users: data.users ?? [], total: data.usersQuantity ?? 0 };
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      return await usersApi.fetchUserById(id);
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

function upsertUsers(state, users) {
  users.forEach((user) => {
    if (!user?._id) return;

    state.entities[user._id] = { ...state.entities[user._id], ...user };
  });
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearProfile(state) {
      state.profile = null;
      state.profileStatus = REQUEST_STATUS.idle;
      state.profileError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = REQUEST_STATUS.loading;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = REQUEST_STATUS.succeeded;
        state.ids = action.payload.users.map((user) => user._id);
        state.total = action.payload.total;
        upsertUsers(state, action.payload.users);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = REQUEST_STATUS.failed;
        state.error = action.payload?.message ?? 'Не вдалося завантажити користувачів.';
      })

      .addCase(fetchUserById.pending, (state) => {
        state.profileStatus = REQUEST_STATUS.loading;
        state.profileError = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.profileStatus = REQUEST_STATUS.succeeded;
        state.profile = action.payload;
        upsertUsers(state, [action.payload]);
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.profileStatus = REQUEST_STATUS.failed;
        state.profileError = action.payload?.message ?? 'Користувача не знайдено.';
      });
  },
});

export const { clearProfile } = usersSlice.actions;

export default usersSlice.reducer;
