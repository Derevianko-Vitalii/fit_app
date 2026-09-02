import { useCallback, useSyncExternalStore } from 'react';

/**
 * Підписка на CSS media query з JS.
 *
 * Реалізовано через useSyncExternalStore — це штатний спосіб читати
 * стан зовнішнього джерела без setState всередині ефекту
 * (інакше виникають каскадні перерендери).
 *
 * @param {string} query Наприклад '(max-width: 767px)'.
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia(query);

      mediaQuery.addEventListener('change', onStoreChange);

      return () => mediaQuery.removeEventListener('change', onStoreChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
