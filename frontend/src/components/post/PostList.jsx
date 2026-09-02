import { memo } from 'react';
import PostCard from './PostCard';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Button from '@/components/ui/Button';
import styles from './PostList.module.scss';

/**
 * Презентаційний список публікацій — сам нічого не завантажує,
 * усі дані та колбеки приходять від контейнера.
 *
 * @param {object} props
 * @param {object[]} props.posts
 * @param {boolean} [props.isLoading]
 * @param {string} [props.error]
 * @param {boolean} [props.hasMore]
 * @param {() => void} [props.onLoadMore]
 * @param {() => void} [props.onRetry]
 */
function PostList({
  posts,
  isLoading = false,
  error = '',
  hasMore = false,
  onLoadMore,
  onRetry,
  emptyTitle = 'Публікацій поки немає',
  emptyDescription = 'Створіть першу публікацію — і вона з’явиться тут.',
  emptyAction = null,
}) {
  if (error && !posts.length) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (isLoading && !posts.length) {
    return <Spinner />;
  }

  if (!posts.length) {
    return (
      <EmptyState
        icon="📝"
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className={styles.list}>
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      {error && <ErrorMessage message={error} onRetry={onRetry} />}

      {hasMore && (
        <div className={styles.loadMore}>
          <Button variant="secondary" onClick={onLoadMore} isLoading={isLoading}>
            Показати ще
          </Button>
        </div>
      )}
    </div>
  );
}

export default memo(PostList);
