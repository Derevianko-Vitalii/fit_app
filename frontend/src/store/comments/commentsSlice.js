import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as commentsApi from '@/api/commentsApi';
import { REQUEST_STATUS } from '@/constants';
import { toRejectedPayload } from '@/utils/errorHandler';

const initialState = {
  /** Коментарі, згруповані за id публікації: { [postId]: Comment[] } */
  byPost: {},
  /** Статус завантаження для кожної публікації окремо. */
  statusByPost: {},
  error: null,
};

export const fetchCommentsByPost = createAsyncThunk(
  'comments/fetchByPost',
  async (postId, { rejectWithValue }) => {
    try {
      const data = await commentsApi.fetchCommentsByPost(postId);

      return { postId, comments: Array.isArray(data) ? data : [] };
    } catch (error) {
      return rejectWithValue({ postId, ...toRejectedPayload(error) });
    }
  }
);

export const createComment = createAsyncThunk(
  'comments/create',
  async ({ post, content }, { rejectWithValue }) => {
    try {
      return await commentsApi.createComment({ post, content });
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/update',
  async ({ id, postId, payload }, { rejectWithValue }) => {
    try {
      const data = await commentsApi.updateComment(id, payload);
      return { postId, comment: data };
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/delete',
  async ({ id, postId }, { rejectWithValue }) => {
    try {
      await commentsApi.deleteComment(id);
      return { id, postId };
    } catch (error) {
      return rejectWithValue(toRejectedPayload(error));
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearCommentsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentsByPost.pending, (state, action) => {
        state.statusByPost[action.meta.arg] = REQUEST_STATUS.loading;
      })
      .addCase(fetchCommentsByPost.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;

        state.byPost[postId] = comments;
        state.statusByPost[postId] = REQUEST_STATUS.succeeded;
      })
      .addCase(fetchCommentsByPost.rejected, (state, action) => {
        const postId = action.payload?.postId ?? action.meta.arg;

        state.statusByPost[postId] = REQUEST_STATUS.failed;
        state.error = action.payload?.message ?? 'Не вдалося завантажити коментарі.';
      })

      .addCase(createComment.fulfilled, (state, action) => {
        const comment = action.payload;
        const postId = typeof comment.post === 'string' ? comment.post : comment.post?._id;

        if (!postId) return;

        state.byPost[postId] = [...(state.byPost[postId] ?? []), comment];
      })
      .addCase(createComment.rejected, (state, action) => {
        state.error = action.payload?.message ?? 'Не вдалося додати коментар.';
      })

      .addCase(updateComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const list = state.byPost[postId];

        if (!list) return;

        const index = list.findIndex((item) => item._id === comment._id);

        if (index !== -1) {
          list[index] = comment;
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.error = action.payload?.message ?? 'Не вдалося оновити коментар.';
      })

      .addCase(deleteComment.fulfilled, (state, action) => {
        const { id, postId } = action.payload;

        if (state.byPost[postId]) {
          state.byPost[postId] = state.byPost[postId].filter((item) => item._id !== id);
        }
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.payload?.message ?? 'Не вдалося видалити коментар.';
      });
  },
});

export const { clearCommentsError } = commentsSlice.actions;

export default commentsSlice.reducer;
