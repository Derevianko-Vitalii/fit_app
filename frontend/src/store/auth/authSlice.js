import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '@/api/authApi';
import * as usersApi from '@/api/usersApi';
import { STORAGE_KEYS, REQUEST_STATUS } from '@/constants';
import { storage } from '@/utils/storage';
import { getUserIdFromToken, isTokenValid } from '@/utils/jwt';
import { toRejectedPayload } from '@/utils/errorHandler';

const savedToken = storage.get(STORAGE_KEYS.token);
const initialToken = isTokenValid(savedToken) ? savedToken : null;

if (savedToken && !initialToken) {
  storage.remove(STORAGE_KEYS.token);
}

const initialState = {
  token: initialToken,
  currentUser: null,
  status: REQUEST_STATUS.idle,
  /** Окремий статус для початкового відновлення сесії з localStorage. */
  bootstrapped: !initialToken,
  error: null,
  fieldErrors: {},
};

/** Логін: отримуємо токен, зберігаємо і одразу тягнемо профіль. */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const { token } = await authApi.login(credentials);

      storage.set(STORAGE_KEYS.token, token);

      const userId = getUserIdFromToken(token);
      const user = userId ? await usersApi.fetchUserById(userId) : null;

      return { token, user };
    } catch (error) {
      storage.remove(STORAGE_KEYS.token);
      return rejectWithValue(toRejectedPayload(error));
    } finally {
      dispatch(authSlice.actions.markBootstrapped());
    }
  }
);

/** Реєстрація з автоматичним входом одразу після успіху. */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await authApi.register(payload);

      const result = await dispatch(
        loginUser({ loginOrEmail: payload.login, password: payload.password })
      ).unwrap();

      return result;
    } catch (error) {
      if (error?.message && error?.fields) {
        return rejectWithValue(error);
      }

      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

/** Відновлення сесії при перезавантаженні сторінки. */
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    const token = storage.get(STORAGE_KEYS.token);

    if (!isTokenValid(token)) {
      storage.remove(STORAGE_KEYS.token);
      return rejectWithValue({ message: 'Сесія завершилась', fields: {}, status: 401 });
    }

    try {
      const userId = getUserIdFromToken(token);
      const user = await usersApi.fetchUserById(userId);

      return { token, user };
    } catch (error) {
      storage.remove(STORAGE_KEYS.token);
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.updateProfile(payload);
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await authApi.updatePassword(payload);
      return data.user ?? null;
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

export const toggleFollow = createAsyncThunk(
  'auth/toggleFollow',
  async ({ userId, isFollowing }, { rejectWithValue }) => {
    try {
      const data = isFollowing
        ? await usersApi.unfollowUser(userId)
        : await usersApi.followUser(userId);

      return { user: data, userId, isFollowing: !isFollowing };
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

export const toggleUserAward = createAsyncThunk(
  'auth/toggleUserAward',
  async ({ awardId, isOwned }, { rejectWithValue }) => {
    try {
      return isOwned
        ? await usersApi.removeAwardFromUser(awardId)
        : await usersApi.addAwardToUser(awardId);
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

/** Прибирає пароль із відповіді — він не потрібен у сторі. */
function sanitizeUser(user) {
  if (!user) return null;

  const { password: _password, ...rest } = user;

  return rest;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      storage.remove(STORAGE_KEYS.token);
      state.token = null;
      state.currentUser = null;
      state.status = REQUEST_STATUS.idle;
      state.error = null;
      state.fieldErrors = {};
      state.bootstrapped = true;
    },
    clearAuthError(state) {
      state.error = null;
      state.fieldErrors = {};
    },
    markBootstrapped(state) {
      state.bootstrapped = true;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => {
      state.status = REQUEST_STATUS.loading;
      state.error = null;
      state.fieldErrors = {};
    };

    const setFailed = (state, action) => {
      state.status = REQUEST_STATUS.failed;
      state.error = action.payload?.message ?? 'Не вдалося виконати запит.';
      state.fieldErrors = action.payload?.fields ?? {};
    };

    const setSession = (state, action) => {
      state.status = REQUEST_STATUS.succeeded;
      state.token = action.payload.token;
      state.currentUser = sanitizeUser(action.payload.user);
      state.bootstrapped = true;
      state.error = null;
      state.fieldErrors = {};
    };

    builder
      .addCase(loginUser.pending, setLoading)
      .addCase(loginUser.fulfilled, setSession)
      .addCase(loginUser.rejected, setFailed)

      .addCase(registerUser.pending, setLoading)
      .addCase(registerUser.fulfilled, setSession)
      .addCase(registerUser.rejected, setFailed)

      .addCase(restoreSession.pending, (state) => {
        state.status = REQUEST_STATUS.loading;
      })
      .addCase(restoreSession.fulfilled, setSession)
      .addCase(restoreSession.rejected, (state) => {
        state.status = REQUEST_STATUS.idle;
        state.token = null;
        state.currentUser = null;
        state.bootstrapped = true;
      })

      .addCase(updateProfile.pending, setLoading)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = REQUEST_STATUS.succeeded;
        state.currentUser = sanitizeUser(action.payload);
      })
      .addCase(updateProfile.rejected, setFailed)

      .addCase(changePassword.pending, setLoading)
      .addCase(changePassword.fulfilled, (state, action) => {
        state.status = REQUEST_STATUS.succeeded;

        if (action.payload) {
          state.currentUser = sanitizeUser(action.payload);
        }
      })
      .addCase(changePassword.rejected, setFailed)

      .addCase(toggleFollow.fulfilled, (state, action) => {
        state.currentUser = sanitizeUser(action.payload.user);
      })
      .addCase(toggleFollow.rejected, setFailed)

      .addCase(toggleUserAward.fulfilled, (state, action) => {
        state.currentUser = sanitizeUser(action.payload);
      })
      .addCase(toggleUserAward.rejected, setFailed);
  },
});

export const { logout, clearAuthError, markBootstrapped } = authSlice.actions;

export default authSlice.reducer;
