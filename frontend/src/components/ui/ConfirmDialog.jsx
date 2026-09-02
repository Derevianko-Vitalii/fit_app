import Modal from './Modal';
import Button from './Button';

/**
 * Підтвердження незворотної дії (видалення публікації, цілі тощо).
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onCancel
 * @param {() => void} props.onConfirm
 */
function ConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
  title = 'Підтвердіть дію',
  message = 'Цю дію не можна скасувати.',
  confirmLabel = 'Видалити',
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Скасувати
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}

export default ConfirmDialog;
