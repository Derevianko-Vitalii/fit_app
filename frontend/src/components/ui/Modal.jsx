import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import styles from './Modal.module.scss';

/**
 * Модальне вікно поверх сторінки.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} [props.title]
 * @param {'sm'|'md'|'lg'} [props.size='md']
 */
function Modal({ isOpen, onClose, title, size = 'md', children, footer = null }) {
  const dialogRef = useOutsideClick(onClose, isOpen);

  useEffect(() => {
    if (!isOpen) return undefined;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay}>
      <div
        ref={dialogRef}
        className={[styles.dialog, styles[size]].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрити">
            ×
          </button>
        </header>

        <div className={styles.body}>{children}</div>

        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
