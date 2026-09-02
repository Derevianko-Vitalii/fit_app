import reducer, {
  addGoal,
  incrementGoalProgress,
  loadGoals,
  removeGoal,
  updateGoal,
} from './goalsSlice';
import { GOAL_TYPES } from '@/constants/goals';

/** Створює стан із однією ціллю через реальний екшен addGoal. */
function stateWithGoal(overrides = {}) {
  const initial = reducer(undefined, loadGoals('user-1'));

  return reducer(
    initial,
    addGoal({
      title: 'Пробігти 100 км',
      type: GOAL_TYPES.distance,
      target: 100,
      current: 20,
      unit: 'км',
      ...overrides,
    })
  );
}

describe('goalsSlice', () => {
  it('починає з порожнього списку', () => {
    const state = reducer(undefined, loadGoals('user-1'));

    expect(state.items).toEqual([]);
    expect(state.userId).toBe('user-1');
  });

  it('додає ціль із згенерованим id та датою створення', () => {
    const state = stateWithGoal();

    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ title: 'Пробігти 100 км', target: 100, current: 20 });
    expect(state.items[0].id).toEqual(expect.any(String));
    expect(state.items[0].completedAt).toBeNull();
  });

  it('оновлює ціль і не чіпає інші поля', () => {
    const state = stateWithGoal();
    const { id } = state.items[0];

    const next = reducer(state, updateGoal({ id, changes: { title: 'Нова назва' } }));

    expect(next.items[0].title).toBe('Нова назва');
    expect(next.items[0].target).toBe(100);
  });

  it('позначає ціль виконаною, коли досягнуто target', () => {
    const state = stateWithGoal();
    const { id } = state.items[0];

    const next = reducer(state, updateGoal({ id, changes: { current: 100 } }));

    expect(next.items[0].completedAt).toEqual(expect.any(String));
  });

  it('знімає позначку виконання, якщо прогрес відкотили', () => {
    const done = reducer(
      stateWithGoal(),
      updateGoal({ id: stateWithGoal().items[0].id, changes: { current: 100 } })
    );

    const state = stateWithGoal({ current: 100 });
    const { id } = state.items[0];
    const rolledBack = reducer(state, updateGoal({ id, changes: { current: 50 } }));

    expect(done).toBeDefined();
    expect(rolledBack.items[0].completedAt).toBeNull();
  });

  it('додає прогрес і не пускає його нижче нуля', () => {
    const state = stateWithGoal();
    const { id } = state.items[0];

    const increased = reducer(state, incrementGoalProgress({ id, amount: 15 }));
    expect(increased.items[0].current).toBe(35);

    const decreased = reducer(increased, incrementGoalProgress({ id, amount: -1000 }));
    expect(decreased.items[0].current).toBe(0);
  });

  it('видаляє ціль за id', () => {
    const state = stateWithGoal();
    const { id } = state.items[0];

    expect(reducer(state, removeGoal(id)).items).toHaveLength(0);
  });

  it('зберігає цілі в localStorage окремо для користувача', () => {
    stateWithGoal();

    const saved = window.localStorage.getItem('fitapp:goals:user-1');

    expect(JSON.parse(saved)).toHaveLength(1);
  });
});
