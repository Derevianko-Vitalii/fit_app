import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { clearAuthError, loginUser } from '@/store/auth/authSlice';
import {
  selectAuthError,
  selectAuthFieldErrors,
  selectAuthLoading,
} from '@/store/auth/authSelectors';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import { validateLoginForm } from '@/utils/validators';
import styles from './AuthPage.module.scss';

/** Сторінка авторизації. */
function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isLoading = useSelector(selectAuthLoading);
  const serverError = useSelector(selectAuthError);
  const fieldErrors = useSelector(selectAuthFieldErrors);

  const [form, setForm] = useState({ loginOrEmail: '', password: '' });
  const [errors, setErrors] = useState({});

  const redirectTo = location.state?.from ?? ROUTES.home;

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validation = validateLoginForm(form);

    setErrors(validation);

    if (Object.keys(validation).length > 0) return;

    await dispatch(loginUser(form));
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Вхід</h1>
      <p className={styles.subtitle}>Раді бачити знову 👋</p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="Логін або email"
          value={form.loginOrEmail}
          onChange={handleChange('loginOrEmail')}
          error={errors.loginOrEmail || fieldErrors.loginOrEmail}
          autoComplete="username"
          placeholder="user@example.com"
        />

        <Input
          label="Пароль"
          type="password"
          value={form.password}
          onChange={handleChange('password')}
          error={errors.password || fieldErrors.password}
          autoComplete="current-password"
          placeholder="••••••••"
        />

        <ErrorMessage message={serverError} />

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          Увійти
        </Button>
      </form>

      <p className={styles.switch}>
        Ще немає акаунту? <Link to={ROUTES.signup}>Зареєструватись</Link>
      </p>
    </div>
  );
}

export default LoginPage;
