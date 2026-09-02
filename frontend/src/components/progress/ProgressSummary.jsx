import { memo } from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './ProgressSummary.module.scss';

/**
 * Зведення по всіх цілях користувача — шапка сторінки Progress.
 * @param {{ summary: { total: number, completed: number, active: number, averageProgress: number } }} props
 */
function ProgressSummary({ summary }) {
  const { total, completed, active, averageProgress } = summary;

  const tiles = [
    { label: 'Усього цілей', value: total, icon: '🎯' },
    { label: 'Активні', value: active, icon: '🔄' },
    { label: 'Виконані', value: completed, icon: '✅' },
  ];

  return (
    <section className={styles.summary}>
      <div className={styles.tiles}>
        {tiles.map((tile) => (
          <div key={tile.label} className={styles.tile}>
            <span className={styles.tileIcon} aria-hidden="true">
              {tile.icon}
            </span>
            <span className={styles.tileValue}>{tile.value}</span>
            <span className={styles.tileLabel}>{tile.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.overall}>
        <ProgressBar
          value={averageProgress}
          tone={averageProgress >= 100 ? 'success' : 'primary'}
          showLabel
          label="Середній прогрес по всіх цілях"
        />
      </div>
    </section>
  );
}

export default memo(ProgressSummary);
