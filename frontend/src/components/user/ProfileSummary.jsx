import { memo } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import FollowButton from './FollowButton';
import { formatCount, getFullName } from '@/utils/formatters';
import { ROUTES } from '@/constants';
import styles from './ProfileSummary.module.scss';

/**
 * Картка профілю для лівої колонки сторінки Account —
 * відтворює блок із макета: аватар, ім'я, пошта, три лічильники
 * та основна дія.
 *
 * @param {object} props
 * @param {object} props.user
 * @param {boolean} props.isOwnProfile
 * @param {number} props.postsCount
 * @param {() => void} props.onShowFollowers
 * @param {() => void} props.onShowFollowing
 * @param {() => void} [props.onCreatePost]
 */
function ProfileSummary({
  user,
  isOwnProfile,
  postsCount = 0,
  onShowFollowers,
  onShowFollowing,
  onCreatePost,
}) {
  if (!user) return null;

  const followingCount = user.followers?.length ?? 0;
  const followersCount = user.followedBy?.length ?? 0;

  return (
    <aside className={styles.card}>
      <h1 className={styles.greeting}>
        {isOwnProfile ? `Привіт, ${user.firstName ?? ''}!` : getFullName(user)}
      </h1>

      <div className={styles.identity}>
        <Avatar user={user} size="lg" />

        <div className={styles.names}>
          <span className={styles.name}>{getFullName(user)}</span>
          <span className={styles.email} title={user.email}>
            {user.email}
          </span>
        </div>
      </div>

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dd className={styles.statValue}>{formatCount(postsCount)}</dd>
          <dt className={styles.statLabel}>Пости</dt>
        </div>

        <button type="button" className={styles.stat} onClick={onShowFollowers}>
          <span className={styles.statValue}>{formatCount(followersCount)}</span>
          <span className={styles.statLabel}>Підписники</span>
        </button>

        <button type="button" className={styles.stat} onClick={onShowFollowing}>
          <span className={styles.statValue}>{formatCount(followingCount)}</span>
          <span className={styles.statLabel}>Підписки</span>
        </button>
      </dl>

      <div className={styles.action}>
        {isOwnProfile ? (
          <Button variant="secondary" fullWidth onClick={onCreatePost}>
            + Нова публікація
          </Button>
        ) : (
          <FollowButton userId={user._id} size="md" fullWidth />
        )}
      </div>

      {isOwnProfile && (
        <Link to={ROUTES.settings} className={styles.settingsLink}>
          ✎ Редагувати профіль
        </Link>
      )}
    </aside>
  );
}

export default memo(ProfileSummary);
