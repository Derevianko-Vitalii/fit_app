import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { clearAuthError, registerUser } from '@/store/auth/authSlice';
import {
  selectAuthError,
  selectAuthFieldErrors,
  selectAuthLoading,
} from '@/store/auth/authSelectors';
import { useAuth } from '@/hooks/useAuth';
import { validateRegisterForm } from '@/utils/validators';
import { GENDERS, ROUTES } from '@/constants';
import styles from './AuthPage.module.scss';

const GENDER_OPTIONS = [
  { value: '', label: 'Не вказувати' },
  ...GENDERS.map((gender) => ({ value: gender, label: gender })),
];

/** Сторінка реєстрації нового користувача. */
function SignUpPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const isLoading = useSelector(selectAuthLoading);
  const serverError = useSelector(selectAuthError);
  const fieldErrors = useSelector(selectAuthFieldErrors);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    login: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    birthdate: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.home, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validation = validateRegisterForm(form);

    setErrors(validation);

    if (Object.keys(validation).length > 0) return;

    const { confirmPassword: _confirm, ...payload } = form;

    await dispatch(
      registerUser({
        ...payload,
        isAdmin: false,
        enabled: true,
        ...(payload.gender ? {} : { gender: undefined }),
      })
    );
  };

  const fieldError = (name) => errors[name] || fieldErrors[name];

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Реєстрація</h1>
      <p className={styles.subtitle}>Створіть акаунт і почніть відстежувати прогрес</p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.row}>
          <Input
            label="Ім'я"
            value={form.firstName}
            onChange={handleChange('firstName')}
            error={fieldError('firstName')}
            autoComplete="given-name"
          />

          <Input
            label="Прізвище"
            value={form.lastName}
            onChange={handleChange('lastName')}
            error={fieldError('lastName')}
            autoComplete="family-name"
          />
        </div>

        <Input
          label="Логін"
          value={form.login}
          onChange={handleChange('login')}
          error={fieldError('login')}
          hint="Латиниця та цифри, 3–10 символів."
          autoComplete="username"
        />

        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange('email')}
          error={fieldError('email')}
          autoComplete="email"
        />

        <div className={styles.row}>
          <Input
            label="Пароль"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            error={fieldError('password')}
            hint="Латиниця та цифри, 7–30 символів."
            autoComplete="new-password"
          />

          <Input
            label="Підтвердження"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={fieldError('confirmPassword')}
            autoComplete="new-password"
          />
        </div>

        <div className={styles.row}>
          <Select
            label="Стать"
            value={form.gender}
            onChange={handleChange('gender')}
            options={GENDER_OPTIONS}
          />

          <Input
            label="Дата народження"
            type="date"
            value={form.birthdate}
            onChange={handleChange('birthdate')}
          />
        </div>

        <ErrorMessage message={serverError} />

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          Створити акаунт
        </Button>
      </form>

      <p className={styles.switch}>
        Вже маєте акаунт? <Link to={ROUTES.login}>Увійти</Link>
      </p>
    </div>
  );
}

export default SignUpPage;
