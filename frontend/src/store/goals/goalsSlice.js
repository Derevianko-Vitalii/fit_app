import { createSlice, nanoid } from '@reduxjs/toolkit';
import { GOAL_TYPES } from '@/constants/goals';
import { storage } from '@/utils/storage';

/**
 * Цілі користувача.
 *
 * УВАГА: бекенд (див. backend/documentation.md) не має сутності "ціль" —
 * нагороди створює лише адміністратор, а прогресу він не зберігає взагалі.
 * Оскільки ТЗ вимагає CRUD цілей і сторінку Progress, цілі живуть на клієнті
 * і персистяться у localStorage окремо для кожного користувача.
 * Коли на бекенді з'явиться /api/goals — достатньо замінити редюсери на thunk-и.
 */
const STORAGE_PREFIX = 'fitapp:goals:';

const storageKey = (userId) => `${STORAGE_PREFIX}${userId ?? 'guest'}`;

function readGoals(userId) {
  const raw = storage.get(storageKey(userId));

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(state) {
  storage.set(storageKey(state.userId), JSON.stringify(state.items));
}

const initialState = {
  userId: null,
  items: [],
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    /** Перечитує цілі при вході/виході користувача. */
    loadGoals(state, action) {
      state.userId = action.payload ?? null;
      state.items = readGoals(state.userId);
    },

    addGoal: {
      reducer(state, action) {
        state.items.unshift(action.payload);
        persist(state);
      },
      prepare({ title, type, target, current, unit, awardId, deadline, note }) {
        return {
          payload: {
            id: nanoid(),
            title: title?.trim() ?? '',
            type: type ?? GOAL_TYPES.count,
            target: Number(target) || 0,
            current: Number(current) || 0,
            unit: unit ?? '',
            awardId: awardId || null,
            deadline: deadline || null,
            note: note?.trim() ?? '',
            createdAt: new Date().toISOString(),
            completedAt: null,
          },
        };
      },
    },

    updateGoal(state, action) {
      const { id, changes } = action.payload;
      const goal = state.items.find((item) => item.id === id);

      if (!goal) return;

      Object.assign(goal, changes);

      if (changes.target !== undefined) goal.target = Number(changes.target) || 0;
      if (changes.current !== undefined) goal.current = Number(changes.current) || 0;

      const isDone = goal.target > 0 && goal.current >= goal.target;
      goal.completedAt = isDone ? (goal.completedAt ?? new Date().toISOString()) : null;

      persist(state);
    },

    /** Швидке додавання прогресу з картки цілі. */
    incrementGoalProgress(state, action) {
      const { id, amount } = action.payload;
      const goal = state.items.find((item) => item.id === id);

      if (!goal) return;

      goal.current = Math.max(0, goal.current + (Number(amount) || 0));

      const isDone = goal.target > 0 && goal.current >= goal.target;
      goal.completedAt = isDone ? (goal.completedAt ?? new Date().toISOString()) : null;

      persist(state);
    },

    removeGoal(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      persist(state);
    },

    clearGoals(state) {
      state.items = [];
      state.userId = null;
    },
  },
});

export const { loadGoals, addGoal, updateGoal, incrementGoalProgress, removeGoal, clearGoals } =
  goalsSlice.actions;

export default goalsSlice.reducer;
