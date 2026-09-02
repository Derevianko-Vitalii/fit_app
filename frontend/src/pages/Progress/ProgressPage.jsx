import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProgressSummary from '@/components/progress/ProgressSummary';
import GoalTypeSection from '@/components/progress/GoalTypeSection';
import GoalForm from '@/components/progress/GoalForm';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { fetchAwards } from '@/store/awards/awardsSlice';
import { selectAwardItems } from '@/store/awards/awardsSelectors';
import {
  selectCompletedGoals,
  selectGoals,
  selectGoalsByType,
  selectGoalsSummary,
} from '@/store/goals/goalsSelectors';
import { useToggle } from '@/hooks/useToggle';
import { GOAL_TYPE_LIST } from '@/constants/goals';
import styles from './ProgressPage.module.scss';

const FILTERS = [
  { id: 'all', label: 'Усі' },
  { id: 'active', label: 'Активні' },
  { id: 'completed', label: 'Виконані' },
];

/**
 * Сторінка прогресу. Поєднана з Awards: цілі можуть бути прив'язані
 * до конкретної нагороди, а блоки прогресу відрізняються залежно
 * від типу цілі — саме як описано в ТЗ.
 */
function ProgressPage() {
  const dispatch = useDispatch();

  const goals = useSelector(selectGoals);
  const goalsByType = useSelector(selectGoalsByType);
  const summary = useSelector(selectGoalsSummary);
  const completedGoals = useSelector(selectCompletedGoals);
  const awards = useSelector(selectAwardItems);

  const [isGoalModalOpen, goalModal] = useToggle(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!awards.length) {
      dispatch(fetchAwards());
    }
  }, [awards.length, dispatch]);

  const awardsById = useMemo(
    () => Object.fromEntries(awards.map((award) => [award._id, award])),
    [awards]
  );

  const visibleSections = useMemo(() => {
    const applyFilter = (list) => {
      if (filter === 'active') return list.filter((goal) => !goal.completedAt);
      if (filter === 'completed') return list.filter((goal) => goal.completedAt);

      return list;
    };

    return GOAL_TYPE_LIST.map((type) => ({
      type,
      goals: applyFilter(goalsByType[type] ?? []),
    })).filter((section) => section.goals.length > 0);
  }, [filter, goalsByType]);

  const handleEditGoal = useCallback(
    (goal) => {
      setEditingGoal(goal);
      goalModal.on();
    },
    [goalModal]
  );

  const closeModal = useCallback(() => {
    goalModal.off();
    setEditingGoal(null);
  }, [goalModal]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Мій прогрес</h1>
          <p className={styles.subtitle}>
            Наочна картина того, наскільки ви наблизились до своїх цілей.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingGoal(null);
            goalModal.on();
          }}
        >
          🎯 Нова ціль
        </Button>
      </header>

      {goals.length === 0 ? (
        <EmptyState
          icon="📈"
          title="Тут поки порожньо"
          description="Створіть першу ціль — і сторінка наповниться графіками вашого прогресу."
          action={
            <Button
              onClick={() => {
                setEditingGoal(null);
                goalModal.on();
              }}
            >
              Створити ціль
            </Button>
          }
        />
      ) : (
        <>
          <ProgressSummary summary={summary} />

          {completedGoals.length > 0 && (
            <div className={styles.streak}>
              <Badge tone="success">
                🎉 Виконано цілей: {completedGoals.length} з {summary.total}
              </Badge>
            </div>
          )}

          <nav className={styles.filters} role="tablist">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                className={[styles.filter, filter === item.id ? styles.filterActive : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {visibleSections.length ? (
            visibleSections.map((section) => (
              <GoalTypeSection
                key={section.type}
                type={section.type}
                goals={section.goals}
                awardsById={awardsById}
                onEditGoal={handleEditGoal}
              />
            ))
          ) : (
            <EmptyState
              icon="🔍"
              title="Нічого не знайдено"
              description="За обраним фільтром цілей немає. Спробуйте інший фільтр."
            />
          )}
        </>
      )}

      <Modal
        isOpen={isGoalModalOpen}
        onClose={closeModal}
        title={editingGoal ? 'Редагувати ціль' : 'Нова ціль'}
      >
        <GoalForm goal={editingGoal} awards={awards} onSuccess={closeModal} onCancel={closeModal} />
      </Modal>
    </div>
  );
}

export default ProgressPage;
