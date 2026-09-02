import { createSelector } from '@reduxjs/toolkit';
import { REQUEST_STATUS } from '@/constants';

const EMPTY_LIST = [];

export const selectCommentsByPostMap = (state) => state.comments.byPost;
export const selectCommentsStatusMap = (state) => state.comments.statusByPost;
export const selectCommentsError = (state) => state.comments.error;

/** Фабрика: коментарі конкретної публікації, відсортовані за датою. */
export const makeSelectCommentsByPost = (postId) =>
  createSelector([selectCommentsByPostMap], (map) => {
    const list = map[postId];

    if (!list?.length) return EMPTY_LIST;

    return [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
  });

export const makeSelectCommentsLoading = (postId) =>
  createSelector([selectCommentsStatusMap], (map) => map[postId] === REQUEST_STATUS.loading);
