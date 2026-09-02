import { memo } from 'react';
import styles from './EmptyState.module.scss';

/**
 * Заглушка для порожніх списків.
 * @param {{ icon?: string, title: string, description?: string, action?: import('react').ReactNode }} props
 */
function EmptyState({ icon = '📭', title, description = '', action = null }) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action}
    </div>
  );
}

export default memo(EmptyState);
