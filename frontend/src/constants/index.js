import { ENV } from '@/config/env';

/** Базовий префікс API. У dev-режимі запити йдуть через проксі Vite на :4000. */
export const API_BASE_URL = ENV.apiUrl;

/** Ключі, під якими зберігаємо дані сесії у localStorage. */
export const STORAGE_KEYS = {
  token: 'fitapp:token',
};

/** Ендпоінти бекенду (див. backend/documentation.md). */
export const ENDPOINTS = {
  users: '/users',
  login: '/users/login',
  updatePassword: '/users/update-password',
  userById: (id) => `/users/${id}`,
  userAwards: (awardId) => `/users/awards/${awardId}`,
  userFollowers: (userId) => `/users/followers/${userId}`,

  posts: '/posts',
  postById: (id) => `/posts/${id}`,

  awards: '/awards',
  awardById: (id) => `/awards/${id}`,

  comments: '/comments',
  commentById: (id) => `/comments/${id}`,
  commentsByPost: (postId) => `/comments/post/${postId}`,
  commentsByUser: (userId) => `/comments/user/${userId}`,
};

/** Параметри пагінації за замовчуванням. */
export const PAGINATION = {
  perPage: 10,
  startPage: 1,
  /** Мінус означає спадання — найновіші пости першими. */
  defaultSort: '-date',
};

/** Статуси асинхронних запитів у Redux-слайсах. */
export const REQUEST_STATUS = {
  idle: 'idle',
  loading: 'loading',
  succeeded: 'succeeded',
  failed: 'failed',
};

/** Шляхи застосунку. */
export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  account: '/account',
  accountById: (id) => `/account/${id}`,
  settings: '/settings',
  awards: '/awards',
  progress: '/progress',
  post: (id) => `/posts/${id}`,
};

export const GENDERS = ['male', 'female', 'other'];
