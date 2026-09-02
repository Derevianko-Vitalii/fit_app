import { memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { incrementGoalProgress, removeGoal } from '@/store/goals/goalsSlice';
import { getGoalProgress } from '@/store/goals/goalsSelectors';
import { showToast } from '@/store/ui/uiSlice';
import { useToggle } from '@/hooks/useToggle';
import { GOAL_TYPE_META } from '@/constants/goals';
import { formatRelativeDate } from '@/utils/formatters';
import styles from './GoalCard.module.scss';

/** Скільки днів лишилось до дедлайну; null — якщо дедлайну немає. */
function getDaysLeft(deadline) {
  if (!deadline) return null;

  const diff = new Date(deadline).getTime() - Date.now();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Картка цілі з візуалізацією прогресу та швидким додаванням результату.
 *
 * @param {object} props
 * @param {object} props.goal
 * @param {object|null} [props.award] Пов'язана нагорода.
 * @param {(goal: object) => void} [props.onEdit]
 */
function GoalCard({ goal, award = null, onEdit }) {
  const dispatch = useDispatch();
  const [isConfirmOpen, confirm] = useToggle(false);
  const [step, setStep] = useState('');

  const meta = GOAL_TYPE_META[goal.type] ?? GOAL_TYPE_META.count;
  const percent = getGoalProgress(goal);
  const isDone = Boolean(goal.completedAt);
  const daysLeft = getDaysLeft(goal.deadline);
  const isOverdue = daysLeft !== null && daysLeft < 0 && !isDone;

  const unit = goal.unit || meta.unit;

  const handleAdd = (amount) => {
    dispatch(incrementGoalProgress({ id: goal.id, amount }));
    setStep('');
  };

  const handleDelete = () => {
    dispatch(removeGoal(goal.id));
    dispatch(showToast('Ціль видалено', 'success'));
    confirm.off();
  };

  return (
    <article className={[styles.card, isDone ? styles.done : ''].filter(Boolean).join(' ')}>
      <header className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          {meta.icon}
        </span>

        <div className={styles.titleBlock}>
          <h3 className={styles.title}>{goal.title}</h3>

          <div className={styles.tags}>
            <Badge>{meta.label}</Badge>
            {isDone && <Badge tone="success">Виконано</Badge>}
            {isOverdue && <Badge tone="danger">Прострочено</Badge>}
            {award && <Badge tone="primary">🏆 {award.content}</Badge>}
          </div>
        </div>

        <div className={styles.headerActions}>
          {onEdit && (
            <button type="button" className={styles.iconButton} onClick={() => onEdit(goal)}>
              ✎
            </button>
          )}
          <button
            type="button"
            className={[styles.iconButton, styles.danger].join(' ')}
            onClick={confirm.on}
            aria-label="Видалити ціль"
          >
            ✕
          </button>
        </div>
      </header>

      <div className={styles.progress}>
        <ProgressBar
          value={percent}
          tone={isDone ? 'success' : 'primary'}
          showLabel
          label={`${goal.current} / ${goal.target} ${unit}`}
        />
      </div>

      {goal.note && <p className={styles.note}>{goal.note}</p>}

      <footer className={styles.footer}>
        <div className={styles.quickAdd}>
          <input
            type="number"
            className={styles.stepInput}
            value={step}
            onChange={(event) => setStep(event.target.value)}
            placeholder={`+ ${unit}`}
            aria-label={`Додати прогрес у ${unit}`}
            min="0"
          />

          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAdd(Number(step))}
            disabled={!step || Number(step) <= 0}
          >
            Додати
          </Button>
        </div>

        <span className={styles.deadline}>
          {isDone
            ? `Завершено ${formatRelativeDate(goal.completedAt)}`
            : daysLeft !== null
              ? isOverdue
                ? `Дедлайн минув ${Math.abs(daysLeft)} дн тому`
                : `Лишилось ${daysLeft} дн`
              : `Створено ${formatRelativeDate(goal.createdAt)}`}
        </span>
      </footer>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onCancel={confirm.off}
        onConfirm={handleDelete}
        title="Видалити ціль?"
        message={`Ціль «${goal.title}» буде видалено разом із прогресом.`}
      />
    </article>
  );
}

export default memo(GoalCard);
