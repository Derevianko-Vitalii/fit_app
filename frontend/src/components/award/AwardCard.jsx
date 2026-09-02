import { memo, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { toggleUserAward } from '@/store/auth/authSlice';
import { showToast } from '@/store/ui/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { formatRelativeDate } from '@/utils/formatters';
import styles from './AwardCard.module.scss';

/**
 * Картка нагороди. Дозволяє взяти нагороду собі, створити
 * публікацію в її межах або поставити ціль (для авторизованих).
 *
 * @param {object} props
 * @param {object} props.award
 * @param {boolean} [props.isOwned]
 * @param {(award: object) => void} [props.onCreatePost]
 * @param {(award: object) => void} [props.onCreateGoal]
 * @param {(award: object) => void} [props.onEdit] Доступно лише адміну.
 * @param {(award: object) => void} [props.onDelete] Доступно лише адміну.
 * @param {number} [props.goalsCount] Скільки цілей прив'язано до нагороди.
 */
function AwardCard({
  award,
  isOwned = false,
  onCreatePost,
  onCreateGoal,
  onEdit,
  onDelete,
  goalsCount = 0,
}) {
  const dispatch = useDispatch();
  const { isAuthenticated, isAdmin } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const imageUrl = award.imageUrls || award.imageUrl;

  const handleToggleOwn = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch(showToast('Увійдіть, щоб відзначати нагороди', 'info'));
      return;
    }

    setIsPending(true);

    const result = await dispatch(toggleUserAward({ awardId: award._id, isOwned }));

    setIsPending(false);

    if (toggleUserAward.fulfilled.match(result)) {
      dispatch(showToast(isOwned ? 'Нагороду знято' : 'Нагороду додано до профілю', 'success'));
    }
  }, [award._id, dispatch, isAuthenticated, isOwned]);

  return (
    <article className={[styles.card, isOwned ? styles.owned : ''].filter(Boolean).join(' ')}>
      <div className={styles.media}>
        {imageUrl ? (
          <img
            src={imageUrl.startsWith('http') ? imageUrl : `/${imageUrl.replace(/^\//, '')}`}
            alt=""
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <span className={styles.placeholder} aria-hidden="true">
            🏆
          </span>
        )}

        {isOwned && <span className={styles.ownedMark}>✓</span>}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{award.content}</h3>

        <div className={styles.badges}>
          {isOwned && <Badge tone="success">Отримано</Badge>}
          {goalsCount > 0 && <Badge tone="accent">🎯 Цілей: {goalsCount}</Badge>}
        </div>

        <time className={styles.date} dateTime={award.date}>
          {formatRelativeDate(award.date)}
        </time>
      </div>

      <div className={styles.actions}>
        <Button
          variant={isOwned ? 'secondary' : 'primary'}
          size="sm"
          onClick={handleToggleOwn}
          isLoading={isPending}
        >
          {isOwned ? 'Прибрати' : 'Отримати'}
        </Button>

        {isAuthenticated && onCreateGoal && (
          <Button variant="ghost" size="sm" onClick={() => onCreateGoal(award)}>
            🎯 Ціль
          </Button>
        )}

        {isAuthenticated && onCreatePost && (
          <Button variant="ghost" size="sm" onClick={() => onCreatePost(award)}>
            ✍️ Пост
          </Button>
        )}

        {isAdmin && onEdit && (
          <Button variant="ghost" size="sm" onClick={() => onEdit(award)}>
            Змінити
          </Button>
        )}

        {isAdmin && onDelete && (
          <Button variant="danger" size="sm" onClick={() => onDelete(award)}>
            Видалити
          </Button>
        )}
      </div>
    </article>
  );
}

export default memo(AwardCard);
