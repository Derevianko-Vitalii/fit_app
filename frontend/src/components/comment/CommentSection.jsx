import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommentsByPost } from '@/store/comments/commentsSlice';
import {
  makeSelectCommentsByPost,
  makeSelectCommentsLoading,
} from '@/store/comments/commentsSelectors';
import Spinner from '@/components/ui/Spinner';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { pluralize } from '@/utils/formatters';
import styles from './CommentSection.module.scss';

/**
 * Контейнер коментарів: завантажує їх для публікації
 * і рендерить список разом із формою додавання.
 *
 * @param {object} props
 * @param {string} props.postId
 * @param {'inline'|'modal'} [props.variant='inline'] У модалці список
 *   займає всю висоту колонки, а форма притиснута донизу — як у макеті.
 */
function CommentSection({ postId, variant = 'inline' }) {
  const dispatch = useDispatch();

  const selectComments = useMemo(() => makeSelectCommentsByPost(postId), [postId]);
  const selectLoading = useMemo(() => makeSelectCommentsLoading(postId), [postId]);

  const comments = useSelector(selectComments);
  const isLoading = useSelector(selectLoading);

  useEffect(() => {
    dispatch(fetchCommentsByPost(postId));
  }, [dispatch, postId]);

  const isModal = variant === 'modal';

  return (
    <section
      className={[styles.section, isModal ? styles.modal : ''].filter(Boolean).join(' ')}
      aria-label="Коментарі"
    >
      <h3 className={styles.title}>
        {comments.length} {pluralize(comments.length, ['коментар', 'коментарі', 'коментарів'])}
      </h3>

      {isLoading && !comments.length ? (
        <Spinner size="sm" />
      ) : (
        <ul className={styles.list}>
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} postId={postId} />
          ))}
        </ul>
      )}

      <CommentForm postId={postId} />
    </section>
  );
}

export default CommentSection;
