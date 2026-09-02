import { memo } from 'react';
import UserCard from './UserCard';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import styles from './FollowerList.module.scss';

/**
 * Список підписок/підписників із можливістю підписатись або відписатись.
 *
 * @param {object} props
 * @param {object[]} props.users
 * @param {boolean} [props.isLoading]
 * @param {string} [props.title]
 */
function FollowerList({
  users = [],
  isLoading = false,
  title = '',
  emptyTitle = 'Список порожній',
  emptyDescription = 'Тут з’являться користувачі, коли ви на когось підпишетесь.',
}) {
  if (isLoading) return <Spinner size="sm" />;

  if (!users.length) {
    return <EmptyState icon="👥" title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <section className={styles.section}>
      {title && <h3 className={styles.title}>{title}</h3>}

      <div className={styles.list}>
        {users.map((user) => (
          <UserCard key={user._id ?? user} user={user} />
        ))}
      </div>
    </section>
  );
}

export default memo(FollowerList);
