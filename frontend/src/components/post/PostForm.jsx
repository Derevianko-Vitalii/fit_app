import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Avatar from '@/components/ui/Avatar';
import { createPost, updatePost, clearPostsError } from '@/store/posts/postsSlice';
import { selectPostMutationError, selectPostMutationStatus } from '@/store/posts/postsSelectors';
import { showToast } from '@/store/ui/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { REQUEST_STATUS } from '@/constants';
import styles from './PostForm.module.scss';

const MAX_LENGTH = 2000;

/**
 * Форма створення або редагування публікації.
 *
 * @param {object} props
 * @param {object} [props.post] Якщо передано — форма працює в режимі редагування.
 * @param {object} [props.award] Нагорода, у межах якої створюється публікація.
 * @param {() => void} [props.onSuccess]
 * @param {() => void} [props.onCancel]
 */
function PostForm({ post = null, award = null, onSuccess, onCancel }) {
  const dispatch = useDispatch();
  const { user } = useAuth();

  const status = useSelector(selectPostMutationStatus);
  const serverError = useSelector(selectPostMutationError);
  const isSubmitting = status === REQUEST_STATUS.loading;

  const isEditMode = Boolean(post);

  const [content, setContent] = useState(post?.content ?? '');
  const [imageUrls, setImageUrls] = useState((post?.imageUrls ?? []).join(', '));
  const [validationError, setValidationError] = useState('');

  useEffect(
    () => () => {
      dispatch(clearPostsError());
    },
    [dispatch]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = content.trim();

    if (!trimmed) {
      setValidationError('Текст публікації не може бути порожнім.');
      return;
    }

    if (trimmed.length > MAX_LENGTH) {
      setValidationError(`Максимум ${MAX_LENGTH} символів.`);
      return;
    }

    setValidationError('');

    const payload = {
      content: trimmed,
      imageUrls: imageUrls
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean),
      enabled: true,
    };

    const action = isEditMode
      ? updatePost({ id: post._id, payload })
      : createPost({ ...payload, ...(award ? { award: award._id } : {}) });

    const result = await dispatch(action);
    const matcher = isEditMode ? updatePost.fulfilled : createPost.fulfilled;

    if (matcher.match(result)) {
      dispatch(showToast(isEditMode ? 'Публікацію оновлено' : 'Публікацію створено', 'success'));

      if (!isEditMode) {
        setContent('');
        setImageUrls('');
      }

      onSuccess?.();
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.top}>
        <Avatar user={user} size="md" />

        <Input
          multiline
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={
            award ? `Розкажіть про прогрес у «${award.content}»…` : 'Чим поділитесь сьогодні?'
          }
          aria-label="Текст публікації"
          error={validationError}
          rows={3}
        />
      </div>

      <Input
        label="Посилання на зображення"
        value={imageUrls}
        onChange={(event) => setImageUrls(event.target.value)}
        placeholder="https://… , https://…"
        hint="Кілька посилань — через кому. Поле необов'язкове."
      />

      <ErrorMessage message={serverError} />

      <div className={styles.footer}>
        <span className={styles.counter}>
          {content.length} / {MAX_LENGTH}
        </span>

        <div className={styles.buttons}>
          {onCancel && (
            <Button variant="secondary" size="sm" onClick={onCancel} disabled={isSubmitting}>
              Скасувати
            </Button>
          )}

          <Button type="submit" size="sm" isLoading={isSubmitting}>
            {isEditMode ? 'Зберегти' : 'Опублікувати'}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default PostForm;
