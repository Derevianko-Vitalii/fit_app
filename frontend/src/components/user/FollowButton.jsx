import { memo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { toggleFollow } from '@/store/auth/authSlice';
import { selectFollowingIds } from '@/store/auth/authSelectors';
import { showToast } from '@/store/ui/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';

/**
 * Кнопка підписки/відписки. Стан визначається за списком
 * followers поточного користувача.
 *
 * @param {{ userId: string, size?: 'sm'|'md'|'lg', fullWidth?: boolean }} props
 */
function FollowButton({ userId, size = 'sm', fullWidth = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const followingIds = useSelector(selectFollowingIds);

  const [isPending, setIsPending] = useState(false);

  const isFollowing = followingIds.has(userId);
  const isSelf = currentUser?._id === userId;

  const handleClick = useCallback(async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.login);
      return;
    }

    setIsPending(true);

    const result = await dispatch(toggleFollow({ userId, isFollowing }));

    setIsPending(false);

    if (toggleFollow.fulfilled.match(result)) {
      dispatch(showToast(isFollowing ? 'Ви відписались' : 'Ви підписались', 'success'));
    }
  }, [dispatch, isAuthenticated, isFollowing, navigate, userId]);

  if (isSelf) return null;

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'primary'}
      size={size}
      fullWidth={fullWidth}
      onClick={handleClick}
      isLoading={isPending}
    >
      {isFollowing ? 'Відписатись' : 'Підписатись'}
    </Button>
  );
}

export default memo(FollowButton);
