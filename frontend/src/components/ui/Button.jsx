import { memo } from 'react';
import styles from './Button.module.scss';

/**
 * Універсальна кнопка застосунку.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.fullWidth]
 * @param {boolean} [props.isLoading]
 * @param {import('react').ReactNode} [props.icon] Іконка перед текстом.
 */
function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon = null,
  type = 'button',
  className = '',
  children,
  disabled,
  ...rest
}) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    isLoading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classNames} disabled={disabled || isLoading} {...rest}>
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      {!isLoading && icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}

export default memo(Button);
