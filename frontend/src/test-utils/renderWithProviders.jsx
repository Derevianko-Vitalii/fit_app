import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { makeStore } from '@/app/store';

/**
 * Рендерить компонент із усіма провайдерами застосунку —
 * Redux-стором та роутером.
 *
 * @param {import('react').ReactElement} ui
 * @param {object} [options]
 * @param {object} [options.preloadedState] Початковий стан Redux.
 * @param {object} [options.store] Готовий store (якщо потрібен спільний).
 * @param {string[]} [options.route] Початковий маршрут.
 * @returns Результат RTL + сам store.
 */
export function renderWithProviders(
  ui,
  { preloadedState, store = makeStore(preloadedState), route = '/', ...renderOptions } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/** Мінімальний користувач для тестів. */
export const mockUser = {
  _id: 'user-1',
  firstName: 'Іван',
  lastName: 'Петренко',
  login: 'ivan',
  email: 'ivan@example.com',
  isAdmin: false,
  enabled: true,
  awards: [],
  followers: [],
  followedBy: [],
  date: '2024-01-01T00:00:00.000Z',
};

/** Мінімальна публікація для тестів. */
export const mockPost = {
  _id: 'post-1',
  content: 'Пробіг сьогодні 10 км',
  imageUrls: [],
  enabled: true,
  likes: 5,
  user: mockUser,
  date: '2024-06-01T10:00:00.000Z',
};

/** Стан авторизованого користувача для preloadedState. */
export const authenticatedState = {
  auth: {
    token: 'Bearer test-token',
    currentUser: mockUser,
    status: 'succeeded',
    bootstrapped: true,
    error: null,
    fieldErrors: {},
  },
};
