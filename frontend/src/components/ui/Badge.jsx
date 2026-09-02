import { memo } from 'react';
import styles from './Badge.module.scss';

/**
 * Невеликий кольоровий чіп.
 * @param {{ tone?: 'neutral'|'primary'|'success'|'accent'|'danger', children: import('react').ReactNode }} props
 */
function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span className={[styles.badge, styles[tone], className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}

export default memo(Badge);
