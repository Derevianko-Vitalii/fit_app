import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PostForm from '@/components/post/PostForm';
import PostList from '@/components/post/PostList';
import UserCard from '@/components/user/UserCard';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Select from '@/components/ui/Select';
import { fetchPosts } from '@/store/posts/postsSlice';
import { fetchUsers } from '@/store/users/usersSlice';
import { setSearchScope } from '@/store/ui/uiSlice';
import {
  selectHasMorePosts,
  selectPostsError,
  selectPostsLoading,
  selectPostsPage,
  selectPostsWithAuthors,
  selectPostsTotal,
} from '@/store/posts/postsSelectors';
import { selectAllUsers, selectUsersLoading } from '@/store/users/usersSelectors';
import { useAuth } from '@/hooks/useAuth';
import { PAGINATION } from '@/constants';
import styles from './HomePage.module.scss';

const SORT_OPTIONS = [
  { value: '-date', label: 'Спочатку нові' },
  { value: 'date', label: 'Спочатку старі' },
  { value: '-likes', label: 'Найпопулярніші' },
];

/**
 * Головна сторінка — стрічка публікацій усіх користувачів
 * із фільтрацією за пошуковим запитом із хедера.
 *
 * Бекенд не має повнотекстового пошуку (filterParser робить точний збіг
 * по полях), тому фільтрація виконується на клієнті по вже завантаженій
 * сторінці даних.
 */
function HomePage() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  const posts = useSelector(selectPostsWithAuthors);
  const isLoading = useSelector(selectPostsLoading);
  const error = useSelector(selectPostsError);
  const hasMore = useSelector(selectHasMorePosts);
  const page = useSelector(selectPostsPage);
  const total = useSelector(selectPostsTotal);
  const sort = useSelector((state) => state.posts.sort);

  const users = useSelector(selectAllUsers);
  const usersLoading = useSelector(selectUsersLoading);

  const searchQuery = useSelector((state) => state.ui.searchQuery);
  const searchScope = useSelector((state) => state.ui.searchScope);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  useEffect(() => {
    dispatch(fetchUsers({ perPage: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPosts({ page: PAGINATION.startPage, sort }));
  }, [dispatch, sort]);

  const handleLoadMore = useCallback(() => {
    dispatch(fetchPosts({ page: page + 1, append: true }));
  }, [dispatch, page]);

  const handleRetry = useCallback(() => {
    dispatch(fetchPosts({ page: PAGINATION.startPage }));
  }, [dispatch]);

  const handleSortChange = useCallback(
    (event) => {
      dispatch(fetchPosts({ page: PAGINATION.startPage, sort: event.target.value }));
    },
    [dispatch]
  );

  const filteredPosts = useMemo(() => {
    if (!isSearching) return posts;

    return posts.filter((post) => {
      const inContent = post.content?.toLowerCase().includes(normalizedQuery);
      const author = post.user;
      const inAuthor = [author?.firstName, author?.lastName, author?.login, author?.email]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalizedQuery));

      return inContent || inAuthor;
    });
  }, [isSearching, normalizedQuery, posts]);

  const filteredUsers = useMemo(() => {
    if (!isSearching) return [];

    return users.filter((user) =>
      [user.firstName, user.lastName, user.login, user.email]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalizedQuery))
    );
  }, [isSearching, normalizedQuery, users]);

  return (
    <div className={styles.page}>
      {isAuthenticated && (
        <div className={styles.composer}>
          <PostForm />
        </div>
      )}

      {isSearching ? (
        <section className={styles.searchResults}>
          <header className={styles.searchHeader}>
            <h2 className={styles.searchTitle}>Результати пошуку: «{searchQuery}»</h2>

            <div className={styles.tabs} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={searchScope === 'posts'}
                className={[styles.tab, searchScope === 'posts' ? styles.tabActive : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => dispatch(setSearchScope('posts'))}
              >
                Публікації ({filteredPosts.length})
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={searchScope === 'users'}
                className={[styles.tab, searchScope === 'users' ? styles.tabActive : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => dispatch(setSearchScope('users'))}
              >
                Користувачі ({filteredUsers.length})
              </button>
            </div>
          </header>

          {searchScope === 'users' ? (
            usersLoading ? (
              <Spinner />
            ) : filteredUsers.length ? (
              <div className={styles.userResults}>
                {filteredUsers.map((user) => (
                  <UserCard key={user._id} user={user} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="🔍"
                title="Користувачів не знайдено"
                description="Спробуйте змінити пошуковий запит."
              />
            )
          ) : (
            <PostList
              posts={filteredPosts}
              isLoading={isLoading}
              error={error}
              onRetry={handleRetry}
              emptyTitle="Публікацій не знайдено"
              emptyDescription="Спробуйте інший запит або завантажте більше публікацій."
            />
          )}
        </section>
      ) : (
        <>
          <div className={styles.feedHeader}>
            <h1 className={styles.feedTitle}>Стрічка</h1>

            <Select
              value={sort}
              onChange={handleSortChange}
              options={SORT_OPTIONS}
              aria-label="Сортування публікацій"
              className={styles.sortSelect}
            />
          </div>

          <p className={styles.total}>Усього публікацій: {total}</p>

          <PostList
            posts={posts}
            isLoading={isLoading}
            error={error}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onRetry={handleRetry}
            emptyTitle="Стрічка порожня"
            emptyDescription={
              isAuthenticated
                ? 'Створіть першу публікацію — вона з’явиться тут.'
                : 'Увійдіть, щоб створити першу публікацію.'
            }
          />
        </>
      )}
    </div>
  );
}

export default HomePage;
