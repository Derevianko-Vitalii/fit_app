import { memo, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PostModal from './PostModal';
import PostForm from './PostForm';
import { deletePost, togglePostLike } from '@/store/posts/postsSlice';
import { showToast } from '@/store/ui/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { useToggle } from '@/hooks/useToggle';
import { likesStorage } from '@/utils/likesStorage';
import { formatCount, formatRelativeDate, getFullName } from '@/utils/formatters';
import { ROUTES } from '@/constants';
import styles from './PostCard.module.scss';

/**
 * Картка публікації. Використовується і в стрічці, і в профілі,
 * і в межах конкретної нагороди — відповідно до ТЗ.
 *
 * @param {object} props
 * @param {object} props.post
 * @param {boolean} [props.showComments=true]
 * @param {object|null} [props.award] Нагорода, у межах якої створено пост.
 */
function PostCard({ post, showComments = true, award = null }) {
  const dispatch = useDispatch();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [isLiked, setIsLiked] = useState(() => likesStorage.isLiked(post._id));
  const [isEditing, editing] = useToggle(false);
  const [isConfirmOpen, confirm] = useToggle(false);
  const [isModalOpen, modal] = useToggle(false);

  const author = typeof post.user === 'object' ? post.user : null;
  const authorId = author?._id ?? (typeof post.user === 'string' ? post.user : null);
  const isOwner = Boolean(currentUser?._id && authorId && currentUser._id === authorId);

  const images = useMemo(
    () => (Array.isArray(post.imageUrls) ? post.imageUrls.filter(Boolean) : []),
    [post.imageUrls]
  );

  const handleLike = useCallback(() => {
    if (!isAuthenticated) {
      dispatch(showToast('Увійдіть, щоб оцінювати публікації', 'info'));
      return;
    }

    const nextLiked = likesStorage.toggle(post._id);
    setIsLiked(nextLiked);

    dispatch(togglePostLike({ id: post._id, likes: post.likes ?? 0, liked: !nextLiked }));
  }, [dispatch, isAuthenticated, post._id, post.likes]);

  const handleDelete = useCallback(async () => {
    const result = await dispatch(deletePost(post._id));

    confirm.off();

    if (deletePost.fulfilled.match(result)) {
      dispatch(showToast('Публікацію видалено', 'success'));
    }
  }, [confirm, dispatch, post._id]);

  if (isEditing) {
    return (
      <article className={styles.card}>
        <PostForm post={post} onCancel={editing.off} onSuccess={editing.off} />
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <Link
          to={authorId ? ROUTES.accountById(authorId) : ROUTES.home}
          className={styles.authorLink}
        >
          <Avatar user={author} size="md" />

          <span className={styles.authorMeta}>
            <span className={styles.authorName}>{getFullName(author)}</span>
            <time className={styles.date} dateTime={post.date}>
              {formatRelativeDate(post.date)}
            </time>
          </span>
        </Link>

        {award && <Badge tone="primary">🏆 {award.content}</Badge>}

        {isOwner && (
          <div className={styles.actions}>
            <button type="button" className={styles.iconButton} onClick={editing.on}>
              Редагувати
            </button>
            <button
              type="button"
              className={[styles.iconButton, styles.danger].join(' ')}
              onClick={confirm.on}
            >
              Видалити
            </button>
          </div>
        )}
      </header>

      <div className={styles.content}>
        <p className={styles.text}>{post.content}</p>

        {images.length > 0 && (
          <div
            className={[styles.gallery, images.length > 1 ? styles.galleryGrid : '']
              .filter(Boolean)
              .join(' ')}
          >
            {images.map((url) => (
              <img
                key={url}
                src={url.startsWith('http') ? url : `/${url.replace(/^\//, '')}`}
                alt=""
                className={styles.image}
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={[styles.action, isLiked ? styles.liked : ''].filter(Boolean).join(' ')}
          onClick={handleLike}
          aria-pressed={isLiked}
        >
          {isLiked ? '❤️' : '🤍'} {formatCount(post.likes ?? 0)}
        </button>

        {showComments && (
          <button type="button" className={styles.action} onClick={modal.on}>
            💬 Коментарі
          </button>
        )}

        <Link to={ROUTES.post(post._id)} className={styles.action}>
          🔗 Відкрити
        </Link>
      </footer>

      {showComments && <PostModal isOpen={isModalOpen} onClose={modal.off} post={post} />}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onCancel={confirm.off}
        onConfirm={handleDelete}
        title="Видалити публікацію?"
        message="Публікацію та її коментарі буде видалено назавжди."
      />
    </article>
  );
}

export default memo(PostCard);
