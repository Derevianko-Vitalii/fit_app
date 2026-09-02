import { memo } from 'react';
import styles from './Spinner.module.scss';

/**
 * Індикатор завантаження.
 * @param {{ size?: 'sm'|'md'|'lg', label?: string, center?: boolean }} props
 */
function Spinner({ size = 'md', label = 'Завантаження…', center = true }) {
  return (
    <div
      className={[styles.wrapper, center ? styles.center : ''].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
    >
      <span className={[styles.spinner, styles[size]].join(' ')} />
      <span className={styles.srOnly}>{label}</span>
    </div>
  );
}

export default memo(Spinner);
