import { createSelector } from '@reduxjs/toolkit';

export const selectGoals = (state) => state.goals.items;

/** Відсоток виконання цілі, обрізаний до 0..100. */
export function getGoalProgress(goal) {
  if (!goal?.target) return 0;

  return Math.min(100, Math.round((goal.current / goal.target) * 100));
}

export const selectActiveGoals = createSelector([selectGoals], (goals) =>
  goals.filter((goal) => !goal.completedAt)
);

export const selectCompletedGoals = createSelector([selectGoals], (goals) =>
  goals.filter((goal) => Boolean(goal.completedAt))
);

/** Зведена статистика для шапки сторінки Progress. */
export const selectGoalsSummary = createSelector([selectGoals], (goals) => {
  const total = goals.length;
  const completed = goals.filter((goal) => goal.completedAt).length;
  const averageProgress = total
    ? Math.round(goals.reduce((sum, goal) => sum + getGoalProgress(goal), 0) / total)
    : 0;

  return { total, completed, active: total - completed, averageProgress };
});

/** Групує цілі за типом — Progress показує окремий блок на кожен тип. */
export const selectGoalsByType = createSelector([selectGoals], (goals) =>
  goals.reduce((acc, goal) => {
    (acc[goal.type] ??= []).push(goal);
    return acc;
  }, {})
);

/** Цілі, прив'язані до конкретної нагороди. */
export const makeSelectGoalsByAward = (awardId) =>
  createSelector([selectGoals], (goals) => goals.filter((goal) => goal.awardId === awardId));
