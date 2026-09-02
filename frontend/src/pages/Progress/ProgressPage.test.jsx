import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgressPage from './ProgressPage';
import { authenticatedState, renderWithProviders } from '@/test-utils/renderWithProviders';
import * as awardsApi from '@/api/awardsApi';

jest.mock('@/api/awardsApi');

beforeEach(() => {
  jest.clearAllMocks();
  awardsApi.fetchAwards.mockResolvedValue([]);
});

describe('ProgressPage — повний цикл CRUD цілей', () => {
  it('показує заглушку, коли цілей немає', async () => {
    renderWithProviders(<ProgressPage />, { preloadedState: authenticatedState });

    expect(await screen.findByText('Тут поки порожньо')).toBeInTheDocument();
  });

  it('створює ціль через форму і показує її прогрес', async () => {
    const user = userEvent.setup();

    const { store } = renderWithProviders(<ProgressPage />, {
      preloadedState: authenticatedState,
    });

    await user.click(await screen.findByRole('button', { name: 'Створити ціль' }));

    const dialog = await screen.findByRole('dialog');

    await user.type(within(dialog).getByLabelText('Назва цілі'), 'Пробігти 100 км');
    await user.clear(within(dialog).getByLabelText('Ціль'));
    await user.type(within(dialog).getByLabelText('Ціль'), '100');
    await user.clear(within(dialog).getByLabelText('Уже досягнуто'));
    await user.type(within(dialog).getByLabelText('Уже досягнуто'), '25');

    await user.click(within(dialog).getByRole('button', { name: 'Створити ціль' }));

    await waitFor(() => {
      expect(store.getState().goals.items).toHaveLength(1);
    });

    expect(await screen.findByText('Пробігти 100 км')).toBeInTheDocument();

    const goalBar = screen.getByRole('progressbar', { name: '25 / 100 раз' });
    expect(goalBar).toHaveAttribute('aria-valuenow', '25');
  });

  it('не створює ціль із нульовим цільовим значенням', async () => {
    const user = userEvent.setup();

    const { store } = renderWithProviders(<ProgressPage />, {
      preloadedState: authenticatedState,
    });

    await user.click(await screen.findByRole('button', { name: 'Створити ціль' }));

    const dialog = await screen.findByRole('dialog');

    await user.type(within(dialog).getByLabelText('Назва цілі'), 'Без цілі');
    await user.click(within(dialog).getByRole('button', { name: 'Створити ціль' }));

    expect(
      await within(dialog).findByText('Цільове значення має бути більшим за нуль.')
    ).toBeInTheDocument();
    expect(store.getState().goals.items).toHaveLength(0);
  });

  it('додає прогрес і позначає ціль виконаною', async () => {
    const user = userEvent.setup();

    const { store } = renderWithProviders(<ProgressPage />, {
      preloadedState: {
        ...authenticatedState,
        goals: {
          userId: 'user-1',
          items: [
            {
              id: 'goal-1',
              title: 'Присідання',
              type: 'count',
              target: 100,
              current: 90,
              unit: 'раз',
              awardId: null,
              deadline: null,
              note: '',
              createdAt: '2024-06-01T00:00:00.000Z',
              completedAt: null,
            },
          ],
        },
      },
    });

    const input = await screen.findByLabelText('Додати прогрес у раз');

    await user.type(input, '10');
    await user.click(screen.getByRole('button', { name: 'Додати' }));

    await waitFor(() => {
      expect(store.getState().goals.items[0].current).toBe(100);
    });

    expect(store.getState().goals.items[0].completedAt).toEqual(expect.any(String));
    expect(await screen.findByText('Виконано')).toBeInTheDocument();
  });

  it('видаляє ціль після підтвердження', async () => {
    const user = userEvent.setup();

    const { store } = renderWithProviders(<ProgressPage />, {
      preloadedState: {
        ...authenticatedState,
        goals: {
          userId: 'user-1',
          items: [
            {
              id: 'goal-1',
              title: 'Планка',
              type: 'duration',
              target: 300,
              current: 60,
              unit: 'хв',
              awardId: null,
              deadline: null,
              note: '',
              createdAt: '2024-06-01T00:00:00.000Z',
              completedAt: null,
            },
          ],
        },
      },
    });

    await user.click(await screen.findByRole('button', { name: 'Видалити ціль' }));

    const dialog = await screen.findByRole('dialog', { name: 'Видалити ціль?' });

    await user.click(within(dialog).getByRole('button', { name: 'Видалити' }));

    await waitFor(() => {
      expect(store.getState().goals.items).toHaveLength(0);
    });
  });
});
