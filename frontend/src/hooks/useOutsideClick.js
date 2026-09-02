import { useEffect, useRef } from 'react';

/**
 * Викликає handler при кліку поза елементом або натисканні Escape.
 *
 * @param {() => void} handler
 * @param {boolean} [isActive=true] Дозволяє вимкнути слухач, коли він не потрібен.
 * @returns {import('react').RefObject<HTMLElement>}
 */
export function useOutsideClick(handler, isActive = true) {
  const ref = useRef(null);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!isActive) return undefined;

    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handlerRef.current();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handlerRef.current();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return ref;
}
