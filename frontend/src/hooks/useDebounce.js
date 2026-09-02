import { useEffect, useState } from 'react';

/**
 * Повертає значення із затримкою — щоб пошук не смикав API на кожну літеру.
 *
 * @template T
 * @param {T} value Вхідне значення.
 * @param {number} [delay=400] Затримка в мілісекундах.
 * @returns {T}
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
