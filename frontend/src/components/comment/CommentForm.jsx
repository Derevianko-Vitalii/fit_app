import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '@/components/ui/Button';
import { createComment } from '@/store/comments/commentsSlice';
import { useAuth } from '@/hooks/useAuth';
import styles from './CommentForm.module.scss';

/**
 * Поле додавання коментаря під публікацією.
 * @param {{ postId: string }} props
 */
function CommentForm({ postId }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return <p className={styles.guestHint}>Увійдіть, щоб залишити коментар.</p>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = content.trim();

    if (!trimmed) return;

    setIsSubmitting(true);

    const result = await dispatch(createComment({ post: postId, content: trimmed }));

    setIsSubmitting(false);

    if (createComment.fulfilled.match(result)) {
      setContent('');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Написати коментар…"
        aria-label="Новий коментар"
        maxLength={500}
      />

      {content.trim() && (
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          Надіслати
        </Button>
      )}
    </form>
  );
}

export default CommentForm;
