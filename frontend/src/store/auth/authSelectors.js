import { createSelector } from '@reduxjs/toolkit';
import { REQUEST_STATUS } from '@/constants';

export const selectAuthState = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthFieldErrors = (state) => state.auth.fieldErrors;
export const selectIsBootstrapped = (state) => state.auth.bootstrapped;

export const selectIsAuthenticated = createSelector(
  [selectToken, selectCurrentUser],
  (token, user) => Boolean(token && user)
);

export const selectIsAdmin = createSelector([selectCurrentUser], (user) => Boolean(user?.isAdmin));

export const selectAuthLoading = createSelector(
  [selectAuthStatus],
  (status) => status === REQUEST_STATUS.loading
);

export const selectCurrentUserId = createSelector([selectCurrentUser], (user) => user?._id ?? null);

/** Множина id користувачів, на яких підписаний поточний користувач. */
export const selectFollowingIds = createSelector([selectCurrentUser], (user) => {
  const followers = user?.followers ?? [];

  return new Set(followers.map((item) => (typeof item === 'string' ? item : item?._id)));
});

/** Множина id нагород, які вже є в поточного користувача. */
export const selectOwnedAwardIds = createSelector([selectCurrentUser], (user) => {
  const awards = user?.awards ?? [];

  return new Set(awards.map((item) => (typeof item === 'string' ? item : item?._id)));
});
