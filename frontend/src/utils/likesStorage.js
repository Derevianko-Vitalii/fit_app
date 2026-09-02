import { storage } from './storage';

/**
 * Бекенд зберігає лише лічильник лайків (PATCH /api/posts/:id { likes }),
 * без списку тих, хто лайкнув. Тому факт "я вже лайкнув цей пост"
 * тримаємо локально — інакше кнопку можна натискати нескінченно.
 */
const KEY = 'fitapp:likedPosts';

function readAll() {
  const raw = storage.get(KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const likesStorage = {
  /** @returns {Set<string>} */
  getLikedIds() {
    return new Set(readAll());
  },

  isLiked(postId) {
    return readAll().includes(postId);
  },

  toggle(postId) {
    const ids = new Set(readAll());

    if (ids.has(postId)) {
      ids.delete(postId);
    } else {
      ids.add(postId);
    }

    storage.set(KEY, JSON.stringify([...ids]));

    return ids.has(postId);
  },
};
