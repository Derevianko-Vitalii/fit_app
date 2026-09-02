import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '@/constants';
import { storage } from '@/utils/storage';

/** Єдиний axios-інстанс для всіх запитів до API. */
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Колбек, який викликається при 401 — задається зі store,
 * щоб уникнути циклічної залежності api <-> store.
 * @type {(() => void) | null}
 */
let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

/**
 * Бекенд віддає токен уже з префіксом ("Bearer eyJ..."),
 * а passport-jwt читає його з заголовка Authorization.
 * Тому додаємо префікс лише тоді, коли його немає.
 */
function buildAuthHeader(token) {
  if (!token) return null;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

httpClient.interceptors.request.use((config) => {
  const header = buildAuthHeader(storage.get(STORAGE_KEYS.token));

  if (header) {
    config.headers.Authorization = header;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      storage.remove(STORAGE_KEYS.token);
      onUnauthorized?.();
    }

    return Promise.reject(error);
  }
);

export { buildAuthHeader };
export default httpClient;
