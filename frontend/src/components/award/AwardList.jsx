import { memo } from 'react';
import AwardCard from './AwardCard';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorMessage from '@/components/ui/ErrorMessage';
import styles from './AwardList.module.scss';

/**
 * Сітка нагород.
 * @param {object} props
 * @param {object[]} props.awards Нагороди з полем isOwned.
 */
function AwardList({
  awards = [],
  isLoading = false,
  error = '',
  onRetry,
  goalsCountByAward = {},
  ...cardHandlers
}) {
  if (error && !awards.length) return <ErrorMessage message={error} onRetry={onRetry} />;

  if (isLoading && !awards.length) return <Spinner />;

  if (!awards.length) {
    return (
      <EmptyState
        icon="🏆"
        title="Нагород ще немає"
        description="Нагороди створює адміністратор — щойно вони з’являться, ви побачите їх тут."
      />
    );
  }

  return (
    <div className={styles.grid}>
      {awards.map((award) => (
        <AwardCard
          key={award._id}
          award={award}
          isOwned={award.isOwned}
          goalsCount={goalsCountByAward[award._id] ?? 0}
          {...cardHandlers}
        />
      ))}
    </div>
  );
}

export default memo(AwardList);
