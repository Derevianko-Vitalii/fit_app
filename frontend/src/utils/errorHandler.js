/**
 * Бекенд повертає помилки в кількох різних формах:
 *  - { message: 'текст' }
 *  - { email: 'Email already exists', password: '...' }  (помилки валідації)
 *  - рядок
 * Ця функція зводить усе до єдиної структури.
 *
 * @param {unknown} error Помилка з axios або будь-яка інша.
 * @returns {{ message: string, fields: Record<string, string>, status: number|null }}
 */
export function normalizeApiError(error) {
  const status = error?.response?.status ?? null;
  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return { message: data, fields: {}, status };
  }

  if (data && typeof data === 'object') {
    const { message, error: errorText, ...rest } = data;

    /** @type {Record<string, string>} */
    const fields = {};
    Object.entries(rest).forEach(([key, value]) => {
      if (typeof value === 'string') {
        fields[key] = value;
      }
    });

    const primary =
      message ||
      errorText ||
      Object.values(fields)[0] ||
      'Сталася помилка під час запиту до сервера.';

    return { message: String(primary), fields, status };
  }

  if (error?.code === 'ERR_NETWORK') {
    return {
      message: 'Немає зв’язку із сервером. Перевірте, чи запущений бекенд.',
      fields: {},
      status,
    };
  }

  return {
    message: error?.message || 'Невідома помилка.',
    fields: {},
    status,
  };
}

/**
 * Хелпер для createAsyncThunk: повертає серіалізований об'єкт помилки,
 * придатний для зберігання в Redux-стані.
 */
export function toRejectedPayload(error) {
  return normalizeApiError(error);
}
