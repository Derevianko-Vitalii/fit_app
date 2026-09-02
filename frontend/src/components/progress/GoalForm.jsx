import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { addGoal, updateGoal } from '@/store/goals/goalsSlice';
import { showToast } from '@/store/ui/uiSlice';
import { GOAL_TYPE_LIST, GOAL_TYPE_META, GOAL_TYPES } from '@/constants/goals';
import styles from './GoalForm.module.scss';

const TYPE_OPTIONS = GOAL_TYPE_LIST.map((type) => ({
  value: type,
  label: `${GOAL_TYPE_META[type].icon} ${GOAL_TYPE_META[type].label}`,
}));

/**
 * Форма створення та редагування цілі.
 *
 * @param {object} props
 * @param {object|null} [props.goal] Якщо передано — режим редагування.
 * @param {object|null} [props.award] Нагорода, до якої прив'язується ціль.
 * @param {object[]} [props.awards] Список нагород для вибору.
 * @param {() => void} [props.onSuccess]
 * @param {() => void} [props.onCancel]
 */
function GoalForm({ goal = null, award = null, awards = [], onSuccess, onCancel }) {
  const dispatch = useDispatch();
  const isEditMode = Boolean(goal);

  const [form, setForm] = useState({
    title: goal?.title ?? '',
    type: goal?.type ?? GOAL_TYPES.count,
    target: goal?.target ?? '',
    current: goal?.current ?? 0,
    unit: goal?.unit ?? '',
    awardId: goal?.awardId ?? award?._id ?? '',
    deadline: goal?.deadline?.slice(0, 10) ?? '',
    note: goal?.note ?? '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = 'Вкажіть назву цілі.';
    }

    const target = Number(form.target);

    if (!form.target || Number.isNaN(target) || target <= 0) {
      nextErrors.target = 'Цільове значення має бути більшим за нуль.';
    }

    const current = Number(form.current);

    if (form.current !== '' && (Number.isNaN(current) || current < 0)) {
      nextErrors.current = 'Поточне значення не може бути від’ємним.';
    }

    if (form.deadline && new Date(form.deadline) < new Date(new Date().toDateString())) {
      nextErrors.deadline = 'Дедлайн не може бути в минулому.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      title: form.title,
      type: form.type,
      target: Number(form.target),
      current: Number(form.current) || 0,
      unit: form.unit.trim() || GOAL_TYPE_META[form.type].unit,
      awardId: form.awardId || null,
      deadline: form.deadline || null,
      note: form.note,
    };

    if (isEditMode) {
      dispatch(updateGoal({ id: goal.id, changes: payload }));
      dispatch(showToast('Ціль оновлено', 'success'));
    } else {
      dispatch(addGoal(payload));
      dispatch(showToast('Ціль створено', 'success'));
    }

    onSuccess?.();
  };

  const awardOptions = [
    { value: '', label: 'Без прив’язки до нагороди' },
    ...awards.map((item) => ({ value: item._id, label: item.content })),
  ];

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Назва цілі"
        value={form.title}
        onChange={handleChange('title')}
        error={errors.title}
        placeholder="Пробігти 100 км за місяць"
      />

      <div className={styles.row}>
        <Select
          label="Тип цілі"
          value={form.type}
          onChange={handleChange('type')}
          options={TYPE_OPTIONS}
        />

        <Input
          label="Одиниця виміру"
          value={form.unit}
          onChange={handleChange('unit')}
          placeholder={GOAL_TYPE_META[form.type].unit}
          hint={GOAL_TYPE_META[form.type].description}
        />
      </div>

      <div className={styles.row}>
        <Input
          label="Ціль"
          type="number"
          min="0"
          value={form.target}
          onChange={handleChange('target')}
          error={errors.target}
          placeholder="100"
        />

        <Input
          label="Уже досягнуто"
          type="number"
          min="0"
          value={form.current}
          onChange={handleChange('current')}
          error={errors.current}
        />
      </div>

      <div className={styles.row}>
        <Select
          label="Пов’язана нагорода"
          value={form.awardId}
          onChange={handleChange('awardId')}
          options={awardOptions}
        />

        <Input
          label="Дедлайн"
          type="date"
          value={form.deadline}
          onChange={handleChange('deadline')}
          error={errors.deadline}
        />
      </div>

      <Input
        label="Нотатка"
        multiline
        rows={2}
        value={form.note}
        onChange={handleChange('note')}
        placeholder="Наприклад: бігати тричі на тиждень"
      />

      <ErrorMessage message={errors.form} />

      <div className={styles.actions}>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Скасувати
          </Button>
        )}

        <Button type="submit">{isEditMode ? 'Зберегти ціль' : 'Створити ціль'}</Button>
      </div>
    </form>
  );
}

export default GoalForm;
