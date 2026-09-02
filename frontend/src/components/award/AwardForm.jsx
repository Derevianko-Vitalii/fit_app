import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { createAward, updateAward } from '@/store/awards/awardsSlice';
import { showToast } from '@/store/ui/uiSlice';
import styles from './AwardForm.module.scss';

/**
 * Форма створення/редагування нагороди. Доступна лише адміністратору —
 * бекенд захищає ці ендпоінти стратегією jwt-admin.
 *
 * @param {{ award?: object|null, onSuccess?: () => void, onCancel?: () => void }} props
 */
function AwardForm({ award = null, onSuccess, onCancel }) {
  const dispatch = useDispatch();
  const isEditMode = Boolean(award);

  const [content, setContent] = useState(award?.content ?? '');
  const [imageUrl, setImageUrl] = useState(award?.imageUrls ?? award?.imageUrl ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = content.trim();

    if (!trimmed) {
      setError('Вкажіть назву нагороди.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const payload = { content: trimmed, imageUrl: imageUrl.trim() };
    const action = isEditMode ? updateAward({ id: award._id, payload }) : createAward(payload);
    const result = await dispatch(action);

    setIsSubmitting(false);

    const matcher = isEditMode ? updateAward.fulfilled : createAward.fulfilled;

    if (matcher.match(result)) {
      dispatch(showToast(isEditMode ? 'Нагороду оновлено' : 'Нагороду створено', 'success'));
      onSuccess?.();
    } else {
      setError(result.payload?.message ?? 'Не вдалося зберегти нагороду.');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Назва нагороди"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Наприклад: Перші 100 км"
        required
      />

      <Input
        label="Зображення"
        value={imageUrl}
        onChange={(event) => setImageUrl(event.target.value)}
        placeholder="https://… або img/awards/001.png"
        hint="Необов'язкове поле."
      />

      <ErrorMessage message={error} />

      <div className={styles.actions}>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Скасувати
          </Button>
        )}

        <Button type="submit" isLoading={isSubmitting}>
          {isEditMode ? 'Зберегти' : 'Створити'}
        </Button>
      </div>
    </form>
  );
}

export default AwardForm;
