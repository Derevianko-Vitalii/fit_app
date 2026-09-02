import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dismissToast } from '@/store/ui/uiSlice';
import styles from './Toast.module.scss';

const AUTO_DISMISS_MS = 4000;

function ToastItem({ toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <div className={[styles.toast, styles[toast.type]].join(' ')} role="status">
      <span className={styles.message}>{toast.message}</span>
      <button
        type="button"
        className={styles.close}
        onClick={() => dispatch(dismissToast(toast.id))}
        aria-label="Закрити сповіщення"
      >
        ×
      </button>
    </div>
  );
}

/** Контейнер сповіщень — рендериться один раз у корені застосунку. */
function ToastContainer() {
  const toasts = useSelector((state) => state.ui.toasts);

  if (!toasts.length) return null;

  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

export default ToastContainer;
