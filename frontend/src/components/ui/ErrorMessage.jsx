import { memo } from 'react';
import styles from './ErrorMessage.module.scss';

/**
 * Блок з повідомленням про помилку і опційною кнопкою повтору.
 * @param {{ message?: string, onRetry?: () => void }} props
 */
function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className={styles.wrapper} role="alert">
      <span aria-hidden="true">⚠️</span>
      <span className={styles.text}>{message}</span>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Спробувати ще раз
        </button>
      )}
    </div>
  );
}

export default memo(ErrorMessage);
