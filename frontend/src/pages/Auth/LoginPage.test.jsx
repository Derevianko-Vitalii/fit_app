import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import * as authApi from '@/api/authApi';
import * as usersApi from '@/api/usersApi';

jest.mock('@/api/authApi');
jest.mock('@/api/usersApi');

function makeToken(payload) {
  const encode = (obj) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `Bearer ${encode({ alg: 'HS256' })}.${encode(payload)}.sig`;
}

const validToken = makeToken({ id: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LoginPage — інтеграція форми, Redux і API', () => {
  it('рендерить поля та кнопку входу', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText('Логін або email')).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Увійти' })).toBeInTheDocument();
  });

  it('показує помилки валідації і не звертається до API', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: 'Увійти' }));

    expect(await screen.findByText('Вкажіть логін або email.')).toBeInTheDocument();
    expect(screen.getByText('Вкажіть пароль.')).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('надсилає дані на API та зберігає користувача в сторі', async () => {
    authApi.login.mockResolvedValue({ success: true, token: validToken });
    usersApi.fetchUserById.mockResolvedValue({ _id: 'user-1', firstName: 'Іван', awards: [] });

    const user = userEvent.setup();

    const { store } = renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('Логін або email'), 'ivan');
    await user.type(screen.getByLabelText('Пароль'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Увійти' }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        loginOrEmail: 'ivan',
        password: 'secret123',
      });
    });

    await waitFor(() => {
      expect(store.getState().auth.currentUser?._id).toBe('user-1');
    });
  });

  it('показує помилку сервера при невірних даних', async () => {
    authApi.login.mockRejectedValue({
      response: { status: 400, data: { message: 'Password is incorrect' } },
    });

    const user = userEvent.setup();

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('Логін або email'), 'ivan');
    await user.type(screen.getByLabelText('Пароль'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'Увійти' }));

    expect(await screen.findByText('Password is incorrect')).toBeInTheDocument();
  });
});
