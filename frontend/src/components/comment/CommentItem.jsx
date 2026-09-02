import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { deleteComment, updateComment } from '@/store/comments/commentsSlice';
import { showToast } from '@/store/ui/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { useToggle } from '@/hooks/useToggle';
import { formatShortAge, getFullName } from '@/utils/formatters';
import { ROUTES } from '@/constants';
import styles from './CommentItem.module.scss';

/**
 * Один коментар. Розкладка відповідає макету Figma:
 * аватар — автор і текст — час та дії праворуч.
 *
 * @param {{ comment: object, postId: string }} props
 */
function CommentItem({ comment, postId }) {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const [isEditing, editing] = useToggle(false);
  const [draft, setDraft] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);

  const author = typeof comment.user === 'object' ? comment.user : null;
  const authorId = author?._id ?? (typeof comment.user === 'string' ? comment.user : null);
  const isOwner = Boolean(currentUser?._id && authorId && currentUser._id === authorId);
  const profileLink = authorId ? ROUTES.accountById(authorId) : ROUTES.home;

  const handleSave = async () => {
    const trimmed = draft.trim();

    if (!trimmed || trimmed === comment.content) {
      editing.off();
      setDraft(comment.content);
      return;
    }

    setIsSaving(true);

    const result = await dispatch(
      updateComment({ id: comment._id, postId, payload: { content: trimmed } })
    );

    setIsSaving(false);

    if (updateComment.fulfilled.match(result)) {
      editing.off();
    }
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteComment({ id: comment._id, postId }));

    if (deleteComment.fulfilled.match(result)) {
      dispatch(showToast('Коментар видалено', 'success'));
    }
  };

  return (
    <li className={styles.item}>
      <Link to={profileLink}>
        <Avatar user={author} size="sm" />
      </Link>

      <div className={styles.body}>
        <div className={styles.topRow}>
          <Link to={profileLink} className={styles.author}>
            {author?.login ?? getFullName(author)}
          </Link>

          <span className={styles.meta}>
            <time className={styles.date} dateTime={comment.date}>
              {formatShortAge(comment.date)}
            </time>

            {isOwner && !isEditing && (
              <>
                <button type="button" className={styles.action} onClick={editing.on}>
                  Змінити
                </button>
                <button
                  type="button"
                  className={[styles.action, styles.danger].join(' ')}
                  onClick={handleDelete}
                >
                  Видалити
                </button>
              </>
            )}
          </span>
        </div>

        {isEditing ? (
          <div className={styles.editArea}>
            <Input
              multiline
              rows={2}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label="Редагувати коментар"
            />

            <div className={styles.editButtons}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  editing.off();
                  setDraft(comment.content);
                }}
              >
                Скасувати
              </Button>
              <Button size="sm" onClick={handleSave} isLoading={isSaving}>
                Зберегти
              </Button>
            </div>
          </div>
        ) : (
          <p className={styles.text}>{comment.content}</p>
        )}
      </div>
    </li>
  );
}

export default memo(CommentItem);
