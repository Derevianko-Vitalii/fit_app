import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/auth/authSlice';
import usersReducer from '@/store/users/usersSlice';
import postsReducer from '@/store/posts/postsSlice';
import awardsReducer from '@/store/awards/awardsSlice';
import commentsReducer from '@/store/comments/commentsSlice';
import goalsReducer from '@/store/goals/goalsSlice';
import uiReducer from '@/store/ui/uiSlice';
import { ENV } from '@/config/env';

export const rootReducer = {
  auth: authReducer,
  users: usersReducer,
  posts: postsReducer,
  awards: awardsReducer,
  comments: commentsReducer,
  goals: goalsReducer,
  ui: uiReducer,
};

/**
 * Створює новий store. Окрема фабрика потрібна для тестів,
 * щоб кожен тест отримував ізольований стан.
 *
 * @param {object} [preloadedState] Початковий стан.
 */
export function makeStore(preloadedState) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    devTools: !ENV.isProduction,
  });
}

const store = makeStore();

export default store;
