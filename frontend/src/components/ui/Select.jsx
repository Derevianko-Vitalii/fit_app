import { memo, useId } from 'react';
import styles from './Input.module.scss';

/**
 * Випадний список із тим самим оформленням, що й Input.
 *
 * @param {object} props
 * @param {Array<{ value: string, label: string }>} props.options
 */
function Select({ label, error = '', options = [], className = '', id, ...rest }) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      )}

      <select
        id={selectId}
        className={[styles.field, error ? styles.fieldError : ''].filter(Boolean).join(' ')}
        aria-invalid={Boolean(error)}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default memo(Select);
