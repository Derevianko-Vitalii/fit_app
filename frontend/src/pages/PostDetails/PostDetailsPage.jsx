import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PostCard from '@/components/post/PostCard';
import CommentSection from '@/components/comment/CommentSection';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { clearCurrentPost, fetchPostById } from '@/store/posts/postsSlice';
import { selectCurrentPost, selectCurrentPostStatus } from '@/store/posts/postsSelectors';
import { REQUEST_STATUS, ROUTES } from '@/constants';
import styles from './PostDetailsPage.module.scss';

/** Сторінка однієї публікації з розгорнутими коментарями. */
function PostDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const post = useSelector(selectCurrentPost);
  const status = useSelector(selectCurrentPostStatus);

  useEffect(() => {
    dispatch(fetchPostById(id));

    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, id]);

  if (status === REQUEST_STATUS.loading) return <Spinner />;

  if (status === REQUEST_STATUS.failed || !post) {
    return (
      <div className={styles.page}>
        <ErrorMessage message="Публікацію не знайдено або її було видалено." />
        <Link to={ROUTES.home} className={styles.back}>
          ← Повернутись до стрічки
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to={ROUTES.home} className={styles.back}>
        ← До стрічки
      </Link>

      <PostCard post={post} showComments={false} />

      <div className={styles.comments}>
        <CommentSection postId={post._id} />
      </div>
    </div>
  );
}

export default PostDetailsPage;
