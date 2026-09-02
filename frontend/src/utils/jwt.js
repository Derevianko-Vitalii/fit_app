/**
 * Декодує payload JWT без перевірки підпису.
 * Підпис перевіряє бекенд — тут дані потрібні лише щоб
 * дізнатись id користувача та строк дії токена.
 *
 * @param {string|null} token Токен, можливо з префіксом "Bearer ".
 * @returns {object|null} Payload або null, якщо токен некоректний.
 */
export function decodeToken(token) {
  if (!token || typeof token !== 'string') return null;

  const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
  const payloadPart = raw.split('.')[1];

  if (!payloadPart) return null;

  try {
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Перевіряє, чи токен ще діє (з невеликим запасом у 5 секунд).
 * @param {string|null} token
 * @returns {boolean}
 */
export function isTokenValid(token) {
  const payload = decodeToken(token);

  if (!payload?.exp) return false;

  return payload.exp * 1000 > Date.now() + 5000;
}

/** Дістає id користувача з токена. */
export function getUserIdFromToken(token) {
  return decodeToken(token)?.id ?? null;
}
