import reducer, { loginUser, logout, restoreSession } from './authSlice';
import * as authApi from '@/api/authApi';
import * as usersApi from '@/api/usersApi';
import { makeStore } from '@/app/store';
import { STORAGE_KEYS } from '@/constants';

jest.mock('@/api/authApi');
jest.mock('@/api/usersApi');

/** Токен із заданим часом життя. */
function makeToken(payload) {
  const encode = (obj) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `Bearer ${encode({ alg: 'HS256' })}.${encode(payload)}.sig`;
}

const validToken = makeToken({ id: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 });

const profile = {
  _id: 'user-1',
  firstName: 'Іван',
  lastName: 'Петренко',
  password: 'хеш-який-не-має-потрапити-в-стор',
  awards: [],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authSlice — редюсери', () => {
  it('logout очищає токен, користувача та localStorage', () => {
    window.localStorage.setItem(STORAGE_KEYS.token, validToken);

    const state = reducer(
      {
        token: validToken,
        currentUser: profile,
        status: 'succeeded',
        error: null,
        fieldErrors: {},
      },
      logout()
    );

    expect(state.token).toBeNull();
    expect(state.currentUser).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.token)).toBeNull();
  });
});

describe('loginUser — інтеграція з API-шаром', () => {
  it('зберігає токен і підтягує профіль при успішному вході', async () => {
    authApi.login.mockResolvedValue({ success: true, token: validToken });
    usersApi.fetchUserById.mockResolvedValue(profile);

    const store = makeStore();

    await store.dispatch(loginUser({ loginOrEmail: 'ivan', password: 'secret123' }));

    const state = store.getState().auth;

    expect(authApi.login).toHaveBeenCalledWith({ loginOrEmail: 'ivan', password: 'secret123' });
    expect(usersApi.fetchUserById).toHaveBeenCalledWith('user-1');
    expect(state.token).toBe(validToken);
    expect(state.currentUser._id).toBe('user-1');
    expect(window.localStorage.getItem(STORAGE_KEYS.token)).toBe(validToken);
  });

  it('не кладе хеш пароля в стор', async () => {
    authApi.login.mockResolvedValue({ token: validToken });
    usersApi.fetchUserById.mockResolvedValue(profile);

    const store = makeStore();

    await store.dispatch(loginUser({ loginOrEmail: 'ivan', password: 'secret123' }));

    expect(store.getState().auth.currentUser).not.toHaveProperty('password');
  });

  it('зберігає повідомлення сервера при невдалому вході', async () => {
    authApi.login.mockRejectedValue({
      response: { status: 400, data: { message: 'Password is incorrect' } },
    });

    const store = makeStore();

    await store.dispatch(loginUser({ loginOrEmail: 'ivan', password: 'wrong' }));

    const state = store.getState().auth;

    expect(state.status).toBe('failed');
    expect(state.error).toBe('Password is incorrect');
    expect(state.token).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.token)).toBeNull();
  });

  it('розкладає помилки валідації по полях', async () => {
    authApi.login.mockRejectedValue({
      response: { status: 400, data: { loginOrEmail: 'Login or Email is required.' } },
    });

    const store = makeStore();

    await store.dispatch(loginUser({ loginOrEmail: '', password: 'secret123' }));

    expect(store.getState().auth.fieldErrors).toEqual({
      loginOrEmail: 'Login or Email is required.',
    });
  });
});

describe('restoreSession', () => {
  it('відхиляє відновлення, якщо токен протермінований', async () => {
    const expired = makeToken({ id: 'user-1', exp: Math.floor(Date.now() / 1000) - 60 });
    window.localStorage.setItem(STORAGE_KEYS.token, expired);

    const store = makeStore();

    await store.dispatch(restoreSession());

    expect(usersApi.fetchUserById).not.toHaveBeenCalled();
    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.bootstrapped).toBe(true);
  });

  it('відновлює сесію за дійсним токеном', async () => {
    window.localStorage.setItem(STORAGE_KEYS.token, validToken);
    usersApi.fetchUserById.mockResolvedValue(profile);

    const store = makeStore();

    await store.dispatch(restoreSession());

    expect(store.getState().auth.currentUser._id).toBe('user-1');
  });
});
