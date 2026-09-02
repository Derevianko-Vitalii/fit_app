/**
 * Тонка обгортка над localStorage — не падає у середовищах,
 * де сховище недоступне (SSR, приватний режим, тести).
 */
export const storage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* сховище недоступне — мовчки ігноруємо */
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* сховище недоступне — мовчки ігноруємо */
    }
  },
};
