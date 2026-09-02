import { createSelector } from '@reduxjs/toolkit';
import { REQUEST_STATUS } from '@/constants';
import { selectOwnedAwardIds } from '@/store/auth/authSelectors';

export const selectAwardItems = (state) => state.awards.items;
export const selectAwardsStatus = (state) => state.awards.status;
export const selectAwardsError = (state) => state.awards.error;
export const selectAwardsMutationError = (state) => state.awards.mutationError;

export const selectAwardsLoading = createSelector(
  [selectAwardsStatus],
  (status) => status === REQUEST_STATUS.loading
);

/** Нагороди з позначкою, чи вже є вона в поточного користувача. */
export const selectAwardsWithOwnership = createSelector(
  [selectAwardItems, selectOwnedAwardIds],
  (awards, ownedIds) => awards.map((award) => ({ ...award, isOwned: ownedIds.has(award._id) }))
);

export const makeSelectAwardById = (awardId) =>
  createSelector(
    [selectAwardItems],
    (awards) => awards.find((item) => item._id === awardId) ?? null
  );
