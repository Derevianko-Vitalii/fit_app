import { memo } from 'react';
import GoalCard from './GoalCard';
import { GOAL_TYPE_META } from '@/constants/goals';
import { getGoalProgress } from '@/store/goals/goalsSelectors';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './GoalTypeSection.module.scss';

/**
 * Блок цілей одного типу. Відповідно до ТЗ вигляд прогресу
 * відрізняється залежно від типу цілі: тут — власний підсумок
 * у відповідних одиницях виміру плюс картки цілей.
 *
 * @param {object} props
 * @param {string} props.type
 * @param {object[]} props.goals
 * @param {Record<string, object>} [props.awardsById]
 * @param {(goal: object) => void} [props.onEditGoal]
 */
function GoalTypeSection({ type, goals, awardsById = {}, onEditGoal }) {
  const meta = GOAL_TYPE_META[type] ?? GOAL_TYPE_META.count;

  const totalCurrent = goals.reduce((sum, goal) => sum + goal.current, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const sectionPercent = totalTarget ? Math.round((totalCurrent / totalTarget) * 100) : 0;
  const completedCount = goals.filter((goal) => goal.completedAt).length;

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.icon} aria-hidden="true">
            {meta.icon}
          </span>

          <div>
            <h2 className={styles.title}>{meta.label}</h2>
            <p className={styles.subtitle}>
              {completedCount} з {goals.length} виконано · {totalCurrent} / {totalTarget}{' '}
              {goals[0]?.unit || meta.unit}
            </p>
          </div>
        </div>

        <div className={styles.headerProgress}>
          <ProgressBar
            value={sectionPercent}
            size="sm"
            tone={sectionPercent >= 100 ? 'success' : 'accent'}
            showLabel
          />
        </div>
      </header>

      <div className={styles.grid}>
        {goals
          .slice()
          .sort((a, b) => getGoalProgress(b) - getGoalProgress(a))
          .map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              award={goal.awardId ? (awardsById[goal.awardId] ?? null) : null}
              onEdit={onEditGoal}
            />
          ))}
      </div>
    </section>
  );
}

export default memo(GoalTypeSection);
