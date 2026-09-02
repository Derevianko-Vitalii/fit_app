import { createSelector } from '@reduxjs/toolkit';
import { REQUEST_STATUS } from '@/constants';

export const selectUserEntities = (state) => state.users.entities;
export const selectUserIds = (state) => state.users.ids;
export const selectUsersTotal = (state) => state.users.total;
export const selectUsersStatus = (state) => state.users.status;
export const selectUsersError = (state) => state.users.error;

export const selectProfile = (state) => state.users.profile;
export const selectProfileStatus = (state) => state.users.profileStatus;
export const selectProfileError = (state) => state.users.profileError;

export const selectAllUsers = createSelector([selectUserIds, selectUserEntities], (ids, entities) =>
  ids.map((id) => entities[id]).filter(Boolean)
);

export const selectUsersLoading = createSelector(
  [selectUsersStatus],
  (status) => status === REQUEST_STATUS.loading
);

export const selectProfileLoading = createSelector(
  [selectProfileStatus],
  (status) => status === REQUEST_STATUS.loading
);

/** Фабрика селектора: користувач за конкретним id. */
export const makeSelectUserById = (userId) =>
  createSelector([selectUserEntities], (entities) => (userId ? (entities[userId] ?? null) : null));
