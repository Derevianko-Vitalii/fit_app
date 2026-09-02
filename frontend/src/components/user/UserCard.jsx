import { memo } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import FollowButton from './FollowButton';
import { getFullName, pluralize } from '@/utils/formatters';
import { ROUTES } from '@/constants';
import styles from './UserCard.module.scss';

/**
 * Компактна картка користувача — використовується у результатах
 * пошуку та в списку фоловерів.
 *
 * @param {{ user: object, showFollowButton?: boolean }} props
 */
function UserCard({ user, showFollowButton = true }) {
  if (!user) return null;

  const awardsCount = user.awards?.length ?? 0;

  return (
    <article className={styles.card}>
      <Link to={ROUTES.accountById(user._id)} className={styles.link}>
        <Avatar user={user} size="md" />

        <div className={styles.info}>
          <span className={styles.name}>{getFullName(user)}</span>

          <span className={styles.meta}>
            {user.login && <span className={styles.login}>@{user.login}</span>}
            {awardsCount > 0 && (
              <Badge tone="primary">
                🏆 {awardsCount} {pluralize(awardsCount, ['нагорода', 'нагороди', 'нагород'])}
              </Badge>
            )}
          </span>
        </div>
      </Link>

      {showFollowButton && <FollowButton userId={user._id} />}
    </article>
  );
}

export default memo(UserCard);
