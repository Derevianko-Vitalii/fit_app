import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Avatar from '@/components/ui/Avatar';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { changePassword, clearAuthError, updateProfile } from '@/store/auth/authSlice';
import { selectAuthError, selectAuthFieldErrors } from '@/store/auth/authSelectors';
import { showToast } from '@/store/ui/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { validatePasswordForm, validateProfileForm } from '@/utils/validators';
import { GENDERS } from '@/constants';
import styles from './AccountSettingsPage.module.scss';

const GENDER_OPTIONS = [
  { value: '', label: 'Не вказано' },
  ...GENDERS.map((gender) => ({ value: gender, label: gender })),
];

const EMPTY_PASSWORD_FORM = { password: '', newPassword: '', confirmPassword: '' };

/** Розкладає користувача у плоскі поля форми профілю. */
function buildProfileForm(user) {
  return {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    login: user?.login ?? '',
    email: user?.email ?? '',
    gender: user?.gender ?? '',
    birthdate: user?.birthdate?.slice(0, 10) ?? '',
    avatarUrl: user?.avatarUrl ?? '',
  };
}

/** Сторінка налаштувань: основна інформація профілю та зміна пароля. */
function AccountSettingsPage() {
  const dispatch = useDispatch();
  const { user } = useAuth();

  const serverError = useSelector(selectAuthError);
  const fieldErrors = useSelector(selectAuthFieldErrors);

  const [profileForm, setProfileForm] = useState(() => buildProfileForm(user));
  const [syncedUserId, setSyncedUserId] = useState(user?._id ?? null);

  const [profileErrors, setProfileErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  if ((user?._id ?? null) !== syncedUserId) {
    setSyncedUserId(user?._id ?? null);
    setProfileForm(buildProfileForm(user));
  }

  useEffect(
    () => () => {
      dispatch(clearAuthError());
    },
    [dispatch]
  );

  const handleProfileChange = (field) => (event) => {
    setProfileForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    const validation = validateProfileForm(profileForm);

    setProfileErrors(validation);

    if (Object.keys(validation).length > 0) return;

    setIsSavingProfile(true);

    const result = await dispatch(updateProfile(profileForm));

    setIsSavingProfile(false);

    if (updateProfile.fulfilled.match(result)) {
      dispatch(showToast('Профіль оновлено', 'success'));
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    const validation = validatePasswordForm(passwordForm);

    setPasswordErrors(validation);

    if (Object.keys(validation).length > 0) return;

    setIsSavingPassword(true);

    const result = await dispatch(
      changePassword({
        password: passwordForm.password,
        newPassword: passwordForm.newPassword,
      })
    );

    setIsSavingPassword(false);

    if (changePassword.fulfilled.match(result)) {
      dispatch(showToast('Пароль змінено', 'success'));
      setPasswordForm(EMPTY_PASSWORD_FORM);
    }
  };

  const profileFieldError = (name) => profileErrors[name] || fieldErrors[name];

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Налаштування акаунту</h1>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Основна інформація</h2>
        </header>

        <form className={styles.form} onSubmit={handleProfileSubmit} noValidate>
          <div className={styles.avatarRow}>
            <Avatar user={{ ...user, avatarUrl: profileForm.avatarUrl }} size="lg" />

            <Input
              label="Посилання на аватар"
              value={profileForm.avatarUrl}
              onChange={handleProfileChange('avatarUrl')}
              placeholder="https://…"
              hint="Вставте пряме посилання на зображення."
            />
          </div>

          <div className={styles.row}>
            <Input
              label="Ім'я"
              value={profileForm.firstName}
              onChange={handleProfileChange('firstName')}
              error={profileFieldError('firstName')}
            />

            <Input
              label="Прізвище"
              value={profileForm.lastName}
              onChange={handleProfileChange('lastName')}
              error={profileFieldError('lastName')}
            />
          </div>

          <div className={styles.row}>
            <Input
              label="Логін"
              value={profileForm.login}
              onChange={handleProfileChange('login')}
              error={profileFieldError('login')}
            />

            <Input
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={handleProfileChange('email')}
              error={profileFieldError('email')}
            />
          </div>

          <div className={styles.row}>
            <Select
              label="Стать"
              value={profileForm.gender}
              onChange={handleProfileChange('gender')}
              options={GENDER_OPTIONS}
            />

            <Input
              label="Дата народження"
              type="date"
              value={profileForm.birthdate}
              onChange={handleProfileChange('birthdate')}
            />
          </div>

          <ErrorMessage message={serverError} />

          <div className={styles.actions}>
            <Button type="submit" isLoading={isSavingProfile}>
              Зберегти зміни
            </Button>
          </div>
        </form>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Зміна пароля</h2>
        </header>

        <form className={styles.form} onSubmit={handlePasswordSubmit} noValidate>
          <Input
            label="Поточний пароль"
            type="password"
            value={passwordForm.password}
            onChange={handlePasswordChange('password')}
            error={passwordErrors.password || fieldErrors.password}
            autoComplete="current-password"
          />

          <div className={styles.row}>
            <Input
              label="Новий пароль"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange('newPassword')}
              error={passwordErrors.newPassword || fieldErrors.newPassword}
              hint="Латиниця та цифри, 7–30 символів."
              autoComplete="new-password"
            />

            <Input
              label="Підтвердження"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange('confirmPassword')}
              error={passwordErrors.confirmPassword}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.actions}>
            <Button type="submit" variant="secondary" isLoading={isSavingPassword}>
              Змінити пароль
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AccountSettingsPage;
