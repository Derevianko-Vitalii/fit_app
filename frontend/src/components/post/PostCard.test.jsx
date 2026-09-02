import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostCard from './PostCard';
import {
  authenticatedState,
  mockPost,
  mockUser,
  renderWithProviders,
} from '@/test-utils/renderWithProviders';
import * as postsApi from '@/api/postsApi';

jest.mock('@/api/postsApi');
jest.mock('@/api/commentsApi');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PostCard', () => {
  it('показує автора, текст і кількість лайків', () => {
    renderWithProviders(<PostCard post={mockPost} />);

    expect(screen.getByText('Іван Петренко')).toBeInTheDocument();
    expect(screen.getByText('Пробіг сьогодні 10 км')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /5/ })).toBeInTheDocument();
  });

  it('не показує кнопки редагування чужого поста', () => {
    const otherPost = { ...mockPost, user: { ...mockUser, _id: 'user-2' } };

    renderWithProviders(<PostCard post={otherPost} />, {
      preloadedState: authenticatedState,
    });

    expect(screen.queryByRole('button', { name: 'Редагувати' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Видалити' })).not.toBeInTheDocument();
  });

  it('показує кнопки керування власним постом', () => {
    renderWithProviders(<PostCard post={mockPost} />, {
      preloadedState: authenticatedState,
    });

    expect(screen.getByRole('button', { name: 'Редагувати' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Видалити' })).toBeInTheDocument();
  });

  it('надсилає лайк на сервер і запам’ятовує його локально', async () => {
    postsApi.updatePostLikes.mockResolvedValue({ ...mockPost, likes: 6 });

    const user = userEvent.setup();

    renderWithProviders(<PostCard post={mockPost} />, {
      preloadedState: authenticatedState,
    });

    await user.click(screen.getByRole('button', { name: /5/ }));

    expect(postsApi.updatePostLikes).toHaveBeenCalledWith('post-1', 6);
    expect(window.localStorage.getItem('fitapp:likedPosts')).toContain('post-1');
  });

  it('не лайкає, якщо користувач не авторизований, а показує підказку', async () => {
    const user = userEvent.setup();

    const { store } = renderWithProviders(<PostCard post={mockPost} />);

    await user.click(screen.getByRole('button', { name: /5/ }));

    expect(postsApi.updatePostLikes).not.toHaveBeenCalled();
    expect(store.getState().ui.toasts[0].message).toMatch(/Увійдіть, щоб оцінювати/);
  });

  it('відкриває підтвердження перед видаленням', async () => {
    const user = userEvent.setup();

    renderWithProviders(<PostCard post={mockPost} />, {
      preloadedState: authenticatedState,
    });

    await user.click(screen.getByRole('button', { name: 'Видалити' }));

    expect(screen.getByRole('dialog', { name: 'Видалити публікацію?' })).toBeInTheDocument();
    expect(postsApi.deletePost).not.toHaveBeenCalled();
  });

  it('видаляє пост після підтвердження', async () => {
    postsApi.deletePost.mockResolvedValue({ message: 'ok' });

    const user = userEvent.setup();

    renderWithProviders(<PostCard post={mockPost} />, {
      preloadedState: authenticatedState,
    });

    await user.click(screen.getByRole('button', { name: 'Видалити' }));

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Видалити' }));

    expect(postsApi.deletePost).toHaveBeenCalledWith('post-1');
  });
});
