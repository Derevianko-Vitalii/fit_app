import { memo } from 'react';
import styles from './ProgressBar.module.scss';

/**
 * Горизонтальна смуга прогресу.
 *
 * @param {object} props
 * @param {number} props.value Відсоток 0..100.
 * @param {'primary'|'success'|'accent'} [props.tone='primary']
 * @param {'sm'|'md'} [props.size='md']
 * @param {boolean} [props.showLabel]
 */
function ProgressBar({ value, tone = 'primary', size = 'md', showLabel = false, label = '' }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value) || 0));

  return (
    <div className={styles.wrapper}>
      {(showLabel || label) && (
        <div className={styles.meta}>
          {label && <span className={styles.label}>{label}</span>}
          {showLabel && <span className={styles.value}>{clamped}%</span>}
        </div>
      )}

      <div
        className={[styles.track, styles[size]].join(' ')}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Прогрес'}
      >
        <div className={[styles.fill, styles[tone]].join(' ')} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export default memo(ProgressBar);
