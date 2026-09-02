import httpClient from './httpClient';
import { ENDPOINTS } from '@/constants';

/**
 * Реєструє нового користувача.
 * @param {object} payload firstName, lastName, login, email, password, ...
 */
export const register = (payload) =>
  httpClient.post(ENDPOINTS.users, payload).then((res) => res.data);

/**
 * Авторизує користувача.
 * @param {{ loginOrEmail: string, password: string }} credentials
 * @returns {Promise<{ success: boolean, token: string }>}
 */
export const login = (credentials) =>
  httpClient.post(ENDPOINTS.login, credentials).then((res) => res.data);

/** Змінює пароль поточного користувача. */
export const updatePassword = ({ password, newPassword }) =>
  httpClient.post(ENDPOINTS.updatePassword, { password, newPassword }).then((res) => res.data);

/** Оновлює профіль поточного користувача. */
export const updateProfile = (payload) =>
  httpClient.put(ENDPOINTS.users, payload).then((res) => res.data);
