import httpClient from './httpClient';
import { ENDPOINTS } from '@/constants';

/**
 * Повертає відфільтрований список користувачів.
 * @param {object} params perPage, startPage, sort та будь-які поля-фільтри
 * @returns {Promise<{ users: object[], usersQuantity: number }>}
 */
export const fetchUsers = (params = {}) =>
  httpClient.get(ENDPOINTS.users, { params }).then((res) => res.data);

/** Повертає користувача з розгорнутим списком нагород. */
export const fetchUserById = (id) => httpClient.get(ENDPOINTS.userById(id)).then((res) => res.data);

/** Додає нагороду поточному користувачу. */
export const addAwardToUser = (awardId) =>
  httpClient.put(ENDPOINTS.userAwards(awardId)).then((res) => res.data);

/** Прибирає нагороду в поточного користувача. */
export const removeAwardFromUser = (awardId) =>
  httpClient.delete(ENDPOINTS.userAwards(awardId)).then((res) => res.data);

/** Підписатись на користувача. */
export const followUser = (userId) =>
  httpClient.put(ENDPOINTS.userFollowers(userId)).then((res) => res.data);

/** Відписатись від користувача. */
export const unfollowUser = (userId) =>
  httpClient.delete(ENDPOINTS.userFollowers(userId)).then((res) => res.data);
