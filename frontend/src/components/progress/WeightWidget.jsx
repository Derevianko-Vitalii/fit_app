import { memo } from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './WeightWidget.module.scss';

/**
 * Блок ваги з макета: шкала «від — поточне — до» та підсумки.
 * Дані беруться з цілі типу «вага», якщо така є в користувача.
 *
 * @param {object} props
 * @param {object|null} props.goal Ціль типу weight.
 */
function WeightWidget({ goal }) {
  if (!goal) return null;

  const start = goal.current ?? 0;
  const target = goal.target ?? 0;
  const unit = goal.unit || 'кг';

  const percent = target ? Math.min(100, Math.round((start / target) * 100)) : 0;
  const left = Math.max(0, target - start);

  return (
    <section className={styles.widget}>
      <h3 className={styles.title}>Вага</h3>

      <ProgressBar value={percent} tone={percent >= 100 ? 'success' : 'accent'} />

      <div className={styles.scale}>
        <span>0</span>
        <span className={styles.current}>
          {start} {unit}
        </span>
        <span>
          {target} {unit}
        </span>
      </div>

      <ul className={styles.facts}>
        <li>
          Досягнуто —{' '}
          <strong className={styles.good}>
            {start} {unit}
          </strong>
        </li>
        <li>
          Ціль —{' '}
          <strong>
            {target} {unit}
          </strong>
        </li>
        <li>
          Залишилось —{' '}
          <strong className={styles.left}>
            {left} {unit}
          </strong>
        </li>
      </ul>
    </section>
  );
}

export default memo(WeightWidget);
