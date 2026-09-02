/**
 * Клієнтська валідація форм.
 *
 * Правила навмисно дзеркалять серверні
 * (backend/validation/formValidationRules.js), щоб користувач бачив
 * помилку одразу, а не після відповіді сервера. Сервер лишається
 * джерелом істини — його помилки показуються поверх цих.
 */

const NAME_PATTERN = /^[a-zA-Zа-яА-ЯёЁ]+$/;
const LOGIN_PATTERN = /^[a-zA-Z0-9]+$/;
const PASSWORD_PATTERN = /^[a-zA-Z0-9]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** @returns {string} Порожній рядок, якщо помилок немає. */
export function validateName(value, label) {
  const trimmed = (value ?? '').trim();

  if (!trimmed) return `${label} — обов'язкове поле.`;
  if (!NAME_PATTERN.test(trimmed)) {
    return `${label}: сервер не приймає літери «і», «ї», «є», «ґ», дефіси та апострофи.`;
  }
  if (trimmed.length < 2 || trimmed.length > 25) return `${label}: від 2 до 25 символів.`;

  return '';
}

export function validateLogin(value) {
  const trimmed = (value ?? '').trim();

  if (!trimmed) return 'Логін — обов’язкове поле.';
  if (!LOGIN_PATTERN.test(trimmed)) return 'Логін може містити лише латиницю та цифри.';
  if (trimmed.length < 3 || trimmed.length > 10) return 'Логін: від 3 до 10 символів.';

  return '';
}

export function validateEmail(value) {
  const trimmed = (value ?? '').trim();

  if (!trimmed) return 'Email — обов’язкове поле.';
  if (!EMAIL_PATTERN.test(trimmed)) return 'Некоректний формат email.';

  return '';
}

export function validatePassword(value, label = 'Пароль') {
  const password = value ?? '';

  if (!password) return `${label} — обов’язкове поле.`;
  if (!PASSWORD_PATTERN.test(password)) {
    return `${label} може містити лише латиницю та цифри.`;
  }
  if (password.length < 7 || password.length > 30) {
    return `${label}: від 7 до 30 символів.`;
  }

  return '';
}

/** Прибирає порожні повідомлення, лишаючи тільки реальні помилки. */
function compact(errors) {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => Boolean(message)));
}

/**
 * @param {{ loginOrEmail: string, password: string }} form
 * @returns {Record<string, string>}
 */
export function validateLoginForm(form) {
  return compact({
    loginOrEmail: form.loginOrEmail?.trim() ? '' : 'Вкажіть логін або email.',
    password: form.password ? '' : 'Вкажіть пароль.',
  });
}

/**
 * @param {object} form firstName, lastName, login, email, password, confirmPassword
 * @returns {Record<string, string>}
 */
export function validateRegisterForm(form) {
  return compact({
    firstName: validateName(form.firstName, "Ім'я"),
    lastName: validateName(form.lastName, 'Прізвище'),
    login: validateLogin(form.login),
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    confirmPassword: form.password !== form.confirmPassword ? 'Паролі не збігаються.' : '',
  });
}

/**
 * Валідація форми профілю — усі поля необов'язкові,
 * але заповнені мають відповідати правилам.
 */
export function validateProfileForm(form) {
  return compact({
    firstName: form.firstName ? validateName(form.firstName, "Ім'я") : '',
    lastName: form.lastName ? validateName(form.lastName, 'Прізвище') : '',
    login: form.login ? validateLogin(form.login) : '',
    email: form.email ? validateEmail(form.email) : '',
  });
}

/**
 * @param {{ password: string, newPassword: string, confirmPassword: string }} form
 */
export function validatePasswordForm(form) {
  return compact({
    password: form.password ? '' : 'Вкажіть поточний пароль.',
    newPassword: validatePassword(form.newPassword, 'Новий пароль'),
    confirmPassword: form.newPassword !== form.confirmPassword ? 'Паролі не збігаються.' : '',
  });
}
