import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import CommentSection from '@/components/comment/CommentSection';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { getFullName } from '@/utils/formatters';
import { ROUTES } from '@/constants';
import styles from './PostModal.module.scss';

/** Нормалізує шлях до картинки: бекенд віддає і повні URL, і відносні. */
function resolveImage(url) {
  return url.startsWith('http') ? url : `/${url.replace(/^\//, '')}`;
}

/**
 * Публікація у вигляді модального вікна: сам пост ліворуч,
 * коментарі праворуч — розкладка з макета Figma (post.png).
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {object} props.post
 */
function PostModal({ isOpen, onClose, post }) {
  const dialogRef = useOutsideClick(onClose, isOpen);

  useEffect(() => {
    if (!isOpen) return undefined;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const author = typeof post.user === 'object' ? post.user : null;
  const authorId = author?._id ?? (typeof post.user === 'string' ? post.user : null);
  const images = Array.isArray(post.imageUrls) ? post.imageUrls.filter(Boolean) : [];
  const postDate = post.date ? new Date(post.date) : null;

  return createPortal(
    <div className={styles.overlay}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Публікація та коментарі"
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Закрити">
          ✕
        </button>

        <section className={styles.postPane}>
          <header className={styles.author}>
            <Link to={authorId ? ROUTES.accountById(authorId) : ROUTES.home}>
              <Avatar user={author} size="lg" />
            </Link>

            <div className={styles.authorMeta}>
              <Link
                to={authorId ? ROUTES.accountById(authorId) : ROUTES.home}
                className={styles.authorName}
              >
                {getFullName(author)}
              </Link>

              {postDate && (
                <time className={styles.date} dateTime={post.date}>
                  {postDate.toLocaleDateString('uk-UA')}
                </time>
              )}
            </div>
          </header>

          <h2 className={styles.content}>{post.content}</h2>

          {images.length > 0 && (
            <div className={styles.gallery}>
              {images.map((url) => (
                <img key={url} src={resolveImage(url)} alt="" className={styles.image} />
              ))}
            </div>
          )}
        </section>

        <section className={styles.commentsPane}>
          <CommentSection postId={post._id} variant="modal" />
        </section>
      </div>
    </div>,
    document.body
  );
}

export default PostModal;
