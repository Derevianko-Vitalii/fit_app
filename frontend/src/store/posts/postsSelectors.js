import { createSelector } from '@reduxjs/toolkit';
import { REQUEST_STATUS } from '@/constants';
import { selectUserEntities } from '@/store/users/usersSelectors';

export const selectPostItems = (state) => state.posts.items;
export const selectPostsTotal = (state) => state.posts.total;
export const selectPostsStatus = (state) => state.posts.status;
export const selectPostsError = (state) => state.posts.error;
export const selectPostsPage = (state) => state.posts.page;
export const selectPostsPerPage = (state) => state.posts.perPage;
export const selectCurrentPost = (state) => state.posts.currentPost;
export const selectCurrentPostStatus = (state) => state.posts.currentPostStatus;
export const selectPostMutationStatus = (state) => state.posts.mutationStatus;
export const selectPostMutationError = (state) => state.posts.mutationError;

export const selectPostsLoading = createSelector(
  [selectPostsStatus],
  (status) => status === REQUEST_STATUS.loading
);

export const selectHasMorePosts = createSelector(
  [selectPostItems, selectPostsTotal],
  (items, total) => items.length < total
);

/**
 * GET /api/posts повертає автора як голий id (без populate),
 * тому підставляємо повний об'єкт користувача зі словника users.
 */
export const selectPostsWithAuthors = createSelector(
  [selectPostItems, selectUserEntities],
  (posts, users) =>
    posts.map((post) => {
      if (post.user && typeof post.user === 'object') return post;

      return { ...post, user: users[post.user] ?? null, userId: post.user };
    })
);
