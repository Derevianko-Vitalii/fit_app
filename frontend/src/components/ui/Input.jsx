import { memo, useId } from 'react';
import styles from './Input.module.scss';

/**
 * Текстове поле з підписом і повідомленням про помилку.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error] Текст помилки валідації.
 * @param {string} [props.hint] Підказка під полем.
 * @param {boolean} [props.multiline] Рендерить textarea замість input.
 */
function Input({
  label,
  error = '',
  hint = '',
  multiline = false,
  className = '',
  id,
  rows = 4,
  ...rest
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  const Field = multiline ? 'textarea' : 'input';

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}

      <Field
        id={inputId}
        className={[styles.field, error ? styles.fieldError : ''].filter(Boolean).join(' ')}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...(multiline ? { rows } : {})}
        {...rest}
      />

      {error && (
        <span id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}

      {!error && hint && (
        <span id={`${inputId}-hint`} className={styles.hint}>
          {hint}
        </span>
      )}
    </div>
  );
}

export default memo(Input);
