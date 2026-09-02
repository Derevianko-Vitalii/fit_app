import { memo, useState } from 'react';
import { getInitials, getFullName } from '@/utils/formatters';
import styles from './Avatar.module.scss';

/**
 * Аватар користувача. Якщо картинки немає або вона не завантажилась —
 * показує ініціали на кольоровому фоні.
 *
 * @param {object} props
 * @param {object|null} props.user
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md']
 */
function Avatar({ user, size = 'md', className = '' }) {
  const [hasError, setHasError] = useState(false);

  const src = user?.avatarUrl;
  const showImage = Boolean(src) && !hasError;
  const fullName = getFullName(user);

  const classNames = [styles.avatar, styles[size], className].filter(Boolean).join(' ');

  if (showImage) {
    return (
      <img
        className={classNames}
        src={src.startsWith('http') ? src : `/${src.replace(/^\//, '')}`}
        alt={fullName}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <span
      className={[classNames, styles.fallback].join(' ')}
      title={fullName}
      aria-label={fullName}
    >
      {getInitials(user)}
    </span>
  );
}

export default memo(Avatar);
