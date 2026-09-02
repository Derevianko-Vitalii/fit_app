/**
 * Єдина точка доступу до змінних оточення Vite.
 *
 * `import.meta.env` — синтаксис ESM, який Jest (через Babel -> CJS)
 * не вміє розбирати. Тому весь доступ до нього ізольовано тут,
 * а в тестах цей модуль підміняється заглушкою (див. jest.config.cjs).
 */
export const ENV = {
  mode: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
};
