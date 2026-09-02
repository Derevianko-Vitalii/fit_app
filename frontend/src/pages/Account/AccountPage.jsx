import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProfileSummary from '@/components/user/ProfileSummary';
import FollowerList from '@/components/user/FollowerList';
import PostList from '@/components/post/PostList';
import PostForm from '@/components/post/PostForm';
import WeightWidget from '@/components/progress/WeightWidget';
import ProgressBar from '@/components/ui/ProgressBar';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { fetchUserById } from '@/store/users/usersSlice';
import { fetchPosts } from '@/store/posts/postsSlice';
import { fetchAwards } from '@/store/awards/awardsSlice';
import {
  selectProfile,
  selectProfileError,
  selectProfileLoading,
} from '@/store/users/usersSelectors';
import {
  selectPostsError,
  selectPostsLoading,
  selectPostsTotal,
  selectPostsWithAuthors,
} from '@/store/posts/postsSelectors';
import { selectGoals, getGoalProgress } from '@/store/goals/goalsSelectors';
import { GOAL_TYPES } from '@/constants/goals';
import { useAuth } from '@/hooks/useAuth';
import { useToggle } from '@/hooks/useToggle';
import { ROUTES } from '@/constants';
import styles from './AccountPage.module.scss';

/** Скільки нагород і цілей показувати в правій колонці без розгортання. */
const RAIL_LIMIT = 3;

/**
 * Сторінка акаунту в трьохколонковій розкладці з макета:
 * профіль ліворуч, публікації по центру, нагороди й прогрес праворуч.
 */
function AccountPage() {
  const { id: routeUserId } = useParams();
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();

  const profileId = routeUserId ?? currentUser?._id;
  const isOwnProfile = Boolean(currentUser?._id && profileId === currentUser._id);

  const profile = useSelector(selectProfile);
  const isProfileLoading = useSelector(selectProfileLoading);
  const profileError = useSelector(selectProfileError);

  const posts = useSelector(selectPostsWithAuthors);
  const postsTotal = useSelector(selectPostsTotal);
  const arePostsLoading = useSelector(selectPostsLoading);
  const postsError = useSelector(selectPostsError);

  const goals = useSelector(selectGoals);

  const [isFollowersOpen, followersModal] = useToggle(false);
  const [isPostFormOpen, postFormModal] = useToggle(false);
  const [followersMode, setFollowersMode] = useState('followers');

  useEffect(() => {
    if (profileId) {
      dispatch(fetchUserById(profileId));
    }
  }, [dispatch, profileId]);

  useEffect(() => {
    if (profileId) {
      dispatch(fetchPosts({ page: 1, perPage: 50, filters: { user: profileId } }));
    }
  }, [dispatch, profileId]);

  useEffect(() => {
    dispatch(fetchAwards());
  }, [dispatch]);

  const handleShowFollowers = useCallback(() => {
    setFollowersMode('followers');
    followersModal.on();
  }, [followersModal]);

  const handleShowFollowing = useCallback(() => {
    setFollowersMode('following');
    followersModal.on();
  }, [followersModal]);

  const followerUsers = useMemo(() => {
    const source = followersMode === 'followers' ? profile?.followedBy : profile?.followers;

    return (source ?? []).filter((item) => item && typeof item === 'object');
  }, [followersMode, profile]);

  const awards = useMemo(
    () => (profile?.awards ?? []).filter((award) => award && typeof award === 'object'),
    [profile]
  );

  const weightGoal = useMemo(
    () => (isOwnProfile ? (goals.find((goal) => goal.type === GOAL_TYPES.weight) ?? null) : null),
    [goals, isOwnProfile]
  );

  const railGoals = useMemo(
    () => (isOwnProfile ? goals.slice(0, RAIL_LIMIT) : []),
    [goals, isOwnProfile]
  );

  if (isProfileLoading && !profile) return <Spinner />;

  if (profileError && !profile) return <ErrorMessage message={profileError} />;

  if (!profile) {
    return <ErrorMessage message="Профіль недоступний. Можливо, потрібно увійти в акаунт." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.profileColumn}>
        <ProfileSummary
          user={profile}
          isOwnProfile={isOwnProfile}
          postsCount={postsTotal}
          onShowFollowers={handleShowFollowers}
          onShowFollowing={handleShowFollowing}
          onCreatePost={postFormModal.on}
        />
      </div>

      <main className={styles.postsColumn}>
        <h2 className={styles.columnTitle}>Публікації</h2>

        <PostList
          posts={posts}
          isLoading={arePostsLoading}
          error={postsError}
          emptyTitle="Публікацій ще немає"
          emptyDescription={
            isOwnProfile ? 'Поділіться першим досягненням.' : 'Користувач ще нічого не опублікував.'
          }
        />
      </main>

      <aside className={styles.railColumn}>
        <section className={styles.railBlock}>
          <header className={styles.railHeader}>
            <h2 className={styles.columnTitle}>Нагороди</h2>
            <Link to={ROUTES.awards} className={styles.allLink}>
              Усі
            </Link>
          </header>

          {awards.length ? (
            <ul className={styles.medals}>
              {awards.slice(0, RAIL_LIMIT).map((award) => {
                const imageUrl = award.imageUrls || award.imageUrl;

                return (
                  <li key={award._id} className={styles.medal} title={award.content}>
                    <span className={styles.medalCircle}>
                      {imageUrl ? (
                        <img
                          src={
                            imageUrl.startsWith('http')
                              ? imageUrl
                              : `/${imageUrl.replace(/^\//, '')}`
                          }
                          alt=""
                          className={styles.medalImage}
                          loading="lazy"
                        />
                      ) : (
                        '🏆'
                      )}
                    </span>
                    <span className={styles.medalLabel}>{award.content}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.empty}>Нагород поки немає.</p>
          )}
        </section>

        {isOwnProfile && <WeightWidget goal={weightGoal} />}

        {isOwnProfile && (
          <section className={styles.railBlock}>
            <header className={styles.railHeader}>
              <h2 className={styles.columnTitle}>Прогрес</h2>
              <Link to={ROUTES.progress} className={styles.allLink}>
                Усі
              </Link>
            </header>

            {railGoals.length ? (
              <ul className={styles.goals}>
                {railGoals.map((goal) => (
                  <li key={goal.id} className={styles.goalRow}>
                    <ProgressBar
                      value={getGoalProgress(goal)}
                      size="sm"
                      tone={goal.completedAt ? 'success' : 'accent'}
                      label={goal.title}
                      showLabel
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>
                Цілей ще немає. <Link to={ROUTES.progress}>Створити</Link>
              </p>
            )}
          </section>
        )}
      </aside>

      <Modal
        isOpen={isFollowersOpen}
        onClose={followersModal.off}
        title={followersMode === 'followers' ? 'Підписники' : 'Підписки'}
      >
        <FollowerList
          users={followerUsers}
          emptyTitle={followersMode === 'followers' ? 'Підписників немає' : 'Підписок немає'}
          emptyDescription={
            followersMode === 'followers'
              ? 'Публікуйте більше — і на вас почнуть підписуватись.'
              : 'Знайдіть цікавих користувачів через пошук і підпишіться.'
          }
        />
      </Modal>

      <Modal isOpen={isPostFormOpen} onClose={postFormModal.off} title="Нова публікація">
        <PostForm onSuccess={postFormModal.off} onCancel={postFormModal.off} />
      </Modal>
    </div>
  );
}

export default AccountPage;
