/**
 * Форматує дату у відносний вигляд ("5 хв тому"),
 * а для давніх подій — у звичайну дату.
 *
 * @param {string|Date} value ISO-рядок або Date.
 * @returns {string}
 */
export function formatRelativeDate(value) {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 60) return 'щойно';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} хв тому`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} год тому`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} дн тому`;

  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Повертає повне ім'я користувача або запасний варіант.
 * @param {object|null} user
 */
export function getFullName(user) {
  if (!user) return 'Невідомий користувач';

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

  return name || user.login || user.email || 'Невідомий користувач';
}

/**
 * Ініціали для аватара-заглушки.
 * @param {object|null} user
 */
export function getInitials(user) {
  if (!user) return '?';

  const first = user.firstName?.[0] ?? '';
  const last = user.lastName?.[0] ?? '';
  const initials = `${first}${last}`.trim();

  return (initials || user.login?.[0] || '?').toUpperCase();
}

/**
 * Схиляє слово за числом: 1 підписник, 2 підписники, 5 підписників.
 * @param {number} count
 * @param {[string, string, string]} forms [одна, дві, п'ять]
 */
export function pluralize(count, forms) {
  const absolute = Math.abs(count) % 100;
  const remainder = absolute % 10;

  if (absolute > 10 && absolute < 20) return forms[2];
  if (remainder > 1 && remainder < 5) return forms[1];
  if (remainder === 1) return forms[0];

  return forms[2];
}

/** Компактний запис чисел: 1200 -> 1.2K. */
export function formatCount(count) {
  const value = Number(count) || 0;

  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;

  return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}

/**
 * Компактний вік події, як у макеті: «8 h», «12 m», «3 d».
 * @param {string|Date} value
 * @returns {string}
 */
export function formatShortAge(value) {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 60) return 'щойно';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} хв`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} год`;

  return `${Math.floor(diffSeconds / 86400)} дн`;
}
