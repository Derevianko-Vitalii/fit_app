import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as postsApi from '@/api/postsApi';
import { PAGINATION, REQUEST_STATUS } from '@/constants';
import { toRejectedPayload } from '@/utils/errorHandler';

const initialState = {
  items: [],
  total: 0,
  page: PAGINATION.startPage,
  perPage: PAGINATION.perPage,
  sort: PAGINATION.defaultSort,
  status: REQUEST_STATUS.idle,
  error: null,

  currentPost: null,
  currentPostStatus: REQUEST_STATUS.idle,

  /** Стан операцій створення/редагування — окремо від стану списку. */
  mutationStatus: REQUEST_STATUS.idle,
  mutationError: null,
};

/**
 * Завантажує сторінку публікацій.
 * @param {{ page?: number, perPage?: number, sort?: string, append?: boolean, filters?: object }} args
 */
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (args = {}, { getState, rejectWithValue }) => {
    const state = getState().posts;
    const page = args.page ?? state.page;
    const perPage = args.perPage ?? state.perPage;
    const sort = args.sort ?? state.sort;

    try {
      const data = await postsApi.fetchPosts({
        startPage: page,
        perPage,
        sort,
        ...(args.filters ?? {}),
      });

      return {
        posts: data.posts ?? [],
        total: data.postsQuantity ?? 0,
        page,
        perPage,
        sort,
        append: Boolean(args.append),
      };
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (id, { rejectWithValue }) => {
    try {
      return await postsApi.fetchPostById(id);
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (payload, { rejectWithValue }) => {
    try {
      return await postsApi.createPost(payload);
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await postsApi.updatePost(id, payload);
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

export const deletePost = createAsyncThunk('posts/deletePost', async (id, { rejectWithValue }) => {
  try {
    await postsApi.deletePost(id);
    return id;
  } catch (error) {
    return rejectWithValue(toRejectedPayload(error));
  }
});

/**
 * Лайк/анлайк. Бекенд зберігає лише число, тому список тих,
 * хто лайкнув, тримаємо локально (в межах сесії).
 */
export const togglePostLike = createAsyncThunk(
  'posts/togglePostLike',
  async ({ id, likes, liked }, { rejectWithValue }) => {
    const nextLikes = Math.max(0, (Number(likes) || 0) + (liked ? -1 : 1));

    try {
      const data = await postsApi.updatePostLikes(id, nextLikes);
      return { id, likes: data?.likes ?? nextLikes, liked: !liked };
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

/** Нормалізує посилання на автора: бекенд повертає то id, то об'єкт. */
function getPostAuthorId(post) {
  return typeof post?.user === 'string' ? post.user : (post?.user?._id ?? null);
}

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCurrentPost(state) {
      state.currentPost = null;
      state.currentPostStatus = REQUEST_STATUS.idle;
    },
    clearPostsError(state) {
      state.error = null;
      state.mutationError = null;
    },
    setSort(state, action) {
      state.sort = action.payload;
      state.page = PAGINATION.startPage;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = REQUEST_STATUS.loading;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        const { posts, total, page, perPage, sort, append } = action.payload;

        state.status = REQUEST_STATUS.succeeded;
        state.items = append ? [...state.items, ...posts] : posts;
        state.total = total;
        state.page = page;
        state.perPage = perPage;
        state.sort = sort;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = REQUEST_STATUS.failed;
        state.error = action.payload?.message ?? 'Не вдалося завантажити публікації.';
      })

      .addCase(fetchPostById.pending, (state) => {
        state.currentPostStatus = REQUEST_STATUS.loading;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.currentPostStatus = REQUEST_STATUS.succeeded;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.currentPostStatus = REQUEST_STATUS.failed;
        state.error = action.payload?.message ?? 'Публікацію не знайдено.';
      })

      .addCase(createPost.pending, (state) => {
        state.mutationStatus = REQUEST_STATUS.loading;
        state.mutationError = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.mutationStatus = REQUEST_STATUS.succeeded;
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.mutationStatus = REQUEST_STATUS.failed;
        state.mutationError = action.payload?.message ?? 'Не вдалося створити публікацію.';
      })

      .addCase(updatePost.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex((item) => item._id === updated._id);

        if (index !== -1) {
          state.items[index] = { ...updated, user: state.items[index].user ?? updated.user };
        }

        if (state.currentPost?._id === updated._id) {
          state.currentPost = updated;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.mutationError = action.payload?.message ?? 'Не вдалося оновити публікацію.';
      })

      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.total = Math.max(0, state.total - 1);

        if (state.currentPost?._id === action.payload) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload?.message ?? 'Не вдалося видалити публікацію.';
      })

      .addCase(togglePostLike.fulfilled, (state, action) => {
        const { id, likes } = action.payload;
        const post = state.items.find((item) => item._id === id);

        if (post) {
          post.likes = likes;
        }

        if (state.currentPost?._id === id) {
          state.currentPost.likes = likes;
        }
      });
  },
});

export const { clearCurrentPost, clearPostsError, setSort } = postsSlice.actions;
export { getPostAuthorId };

export default postsSlice.reducer;
