import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AwardList from '@/components/award/AwardList';
import AwardForm from '@/components/award/AwardForm';
import PostForm from '@/components/post/PostForm';
import GoalForm from '@/components/progress/GoalForm';
import GoalCard from '@/components/progress/GoalCard';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { deleteAward, fetchAwards } from '@/store/awards/awardsSlice';
import {
  selectAwardsError,
  selectAwardsLoading,
  selectAwardsWithOwnership,
} from '@/store/awards/awardsSelectors';
import { selectGoals } from '@/store/goals/goalsSelectors';
import { showToast } from '@/store/ui/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { useToggle } from '@/hooks/useToggle';
import styles from './AwardsPage.module.scss';

/**
 * Сторінка досягнень. Дозволяє:
 *  - переглядати та отримувати нагороди;
 *  - створювати публікацію в межах усього профілю або конкретної нагороди;
 *  - керувати власними цілями (створення/оновлення/видалення);
 *  - адміністратору — CRUD самих нагород.
 */
function AwardsPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, isAdmin } = useAuth();

  const awards = useSelector(selectAwardsWithOwnership);
  const isLoading = useSelector(selectAwardsLoading);
  const error = useSelector(selectAwardsError);
  const goals = useSelector(selectGoals);

  const [isPostModalOpen, postModal] = useToggle(false);
  const [isGoalModalOpen, goalModal] = useToggle(false);
  const [isAwardModalOpen, awardModal] = useToggle(false);
  const [isDeleteOpen, deleteDialog] = useToggle(false);

  const [selectedAward, setSelectedAward] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingAward, setEditingAward] = useState(null);
  const [awardToDelete, setAwardToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchAwards());
  }, [dispatch]);

  const goalsCountByAward = useMemo(
    () =>
      goals.reduce((acc, goal) => {
        if (goal.awardId) {
          acc[goal.awardId] = (acc[goal.awardId] ?? 0) + 1;
        }

        return acc;
      }, {}),
    [goals]
  );

  const awardsById = useMemo(
    () => Object.fromEntries(awards.map((award) => [award._id, award])),
    [awards]
  );

  const handleCreatePost = useCallback(
    (award) => {
      setSelectedAward(award);
      postModal.on();
    },
    [postModal]
  );

  const handleCreateGoal = useCallback(
    (award) => {
      setSelectedAward(award);
      setEditingGoal(null);
      goalModal.on();
    },
    [goalModal]
  );

  const handleEditGoal = useCallback(
    (goal) => {
      setEditingGoal(goal);
      setSelectedAward(goal.awardId ? (awardsById[goal.awardId] ?? null) : null);
      goalModal.on();
    },
    [awardsById, goalModal]
  );

  const handleEditAward = useCallback(
    (award) => {
      setEditingAward(award);
      awardModal.on();
    },
    [awardModal]
  );

  const handleDeleteAwardRequest = useCallback(
    (award) => {
      setAwardToDelete(award);
      deleteDialog.on();
    },
    [deleteDialog]
  );

  const handleDeleteAwardConfirm = useCallback(async () => {
    const result = await dispatch(deleteAward(awardToDelete._id));

    deleteDialog.off();
    setAwardToDelete(null);

    if (deleteAward.fulfilled.match(result)) {
      dispatch(showToast('Нагороду видалено', 'success'));
    }
  }, [awardToDelete, deleteDialog, dispatch]);

  const closeGoalModal = useCallback(() => {
    goalModal.off();
    setEditingGoal(null);
    setSelectedAward(null);
  }, [goalModal]);

  const closeAwardModal = useCallback(() => {
    awardModal.off();
    setEditingAward(null);
  }, [awardModal]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Досягнення</h1>
          <p className={styles.subtitle}>
            Беріть нагороди, ставте цілі та діліться прогресом зі спільнотою.
          </p>
        </div>

        <div className={styles.headerActions}>
          {isAuthenticated && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedAward(null);
                  setEditingGoal(null);
                  goalModal.on();
                }}
              >
                🎯 Нова ціль
              </Button>

              <Button
                onClick={() => {
                  setSelectedAward(null);
                  postModal.on();
                }}
              >
                ✍️ Нова публікація
              </Button>
            </>
          )}

          {isAdmin && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingAward(null);
                awardModal.on();
              }}
            >
              + Нагорода
            </Button>
          )}
        </div>
      </header>

      <AwardList
        awards={awards}
        isLoading={isLoading}
        error={error}
        onRetry={() => dispatch(fetchAwards())}
        goalsCountByAward={goalsCountByAward}
        onCreatePost={isAuthenticated ? handleCreatePost : undefined}
        onCreateGoal={isAuthenticated ? handleCreateGoal : undefined}
        onEdit={isAdmin ? handleEditAward : undefined}
        onDelete={isAdmin ? handleDeleteAwardRequest : undefined}
      />

      {isAuthenticated && (
        <section className={styles.goalsSection}>
          <h2 className={styles.sectionTitle}>Мої цілі</h2>

          {goals.length ? (
            <div className={styles.goalsGrid}>
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  award={goal.awardId ? (awardsById[goal.awardId] ?? null) : null}
                  onEdit={handleEditGoal}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="🎯"
              title="Цілей поки немає"
              description="Створіть ціль — і слідкуйте за прогресом на окремій сторінці."
              action={
                <Button
                  onClick={() => {
                    setSelectedAward(null);
                    setEditingGoal(null);
                    goalModal.on();
                  }}
                >
                  Створити ціль
                </Button>
              }
            />
          )}
        </section>
      )}

      <Modal
        isOpen={isPostModalOpen}
        onClose={postModal.off}
        title={
          selectedAward ? `Публікація · ${selectedAward.content}` : 'Нова публікація в профілі'
        }
      >
        <PostForm award={selectedAward} onSuccess={postModal.off} onCancel={postModal.off} />
      </Modal>

      <Modal
        isOpen={isGoalModalOpen}
        onClose={closeGoalModal}
        title={editingGoal ? 'Редагувати ціль' : 'Нова ціль'}
      >
        <GoalForm
          goal={editingGoal}
          award={selectedAward}
          awards={awards}
          onSuccess={closeGoalModal}
          onCancel={closeGoalModal}
        />
      </Modal>

      <Modal
        isOpen={isAwardModalOpen}
        onClose={closeAwardModal}
        title={editingAward ? 'Редагувати нагороду' : 'Нова нагорода'}
      >
        <AwardForm award={editingAward} onSuccess={closeAwardModal} onCancel={closeAwardModal} />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onCancel={() => {
          deleteDialog.off();
          setAwardToDelete(null);
        }}
        onConfirm={handleDeleteAwardConfirm}
        title="Видалити нагороду?"
        message={`Нагороду «${awardToDelete?.content ?? ''}» буде видалено для всіх користувачів.`}
      />
    </div>
  );
}

export default AwardsPage;
