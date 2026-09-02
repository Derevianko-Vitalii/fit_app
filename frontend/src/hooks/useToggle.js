import { useCallback, useState } from 'react';

/**
 * Булевий стан із мемоізованими діями.
 *
 * @param {boolean} [initial=false]
 * @returns {[boolean, { on: () => void, off: () => void, toggle: () => void }]}
 */
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);

  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((prev) => !prev), []);

  return [value, { on, off, toggle }];
}
