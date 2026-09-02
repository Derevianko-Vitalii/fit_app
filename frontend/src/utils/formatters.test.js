import { formatCount, formatRelativeDate, getFullName, getInitials, pluralize } from './formatters';

describe('formatRelativeDate', () => {
  it('повертає порожній рядок для відсутньої або некоректної дати', () => {
    expect(formatRelativeDate(null)).toBe('');
    expect(formatRelativeDate('не дата')).toBe('');
  });

  it('показує "щойно" для події менш ніж хвилину тому', () => {
    expect(formatRelativeDate(new Date())).toBe('щойно');
  });

  it('рахує хвилини та години', () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

    expect(formatRelativeDate(tenMinutesAgo)).toBe('10 хв тому');
    expect(formatRelativeDate(threeHoursAgo)).toBe('3 год тому');
  });

  it('для давніх подій повертає повну дату', () => {
    const result = formatRelativeDate('2020-03-15T12:00:00.000Z');

    expect(result).toMatch(/2020/);
    expect(result).not.toMatch(/тому/);
  });
});

describe('getFullName', () => {
  it('склеює ім’я та прізвище', () => {
    expect(getFullName({ firstName: 'Іван', lastName: 'Петренко' })).toBe('Іван Петренко');
  });

  it('відкочується до логіна, потім до email', () => {
    expect(getFullName({ login: 'ivan' })).toBe('ivan');
    expect(getFullName({ email: 'a@b.com' })).toBe('a@b.com');
  });

  it('має запасний варіант для порожнього користувача', () => {
    expect(getFullName(null)).toBe('Невідомий користувач');
  });
});

describe('getInitials', () => {
  it('бере першу літеру імені та прізвища', () => {
    expect(getInitials({ firstName: 'Іван', lastName: 'Петренко' })).toBe('ІП');
  });

  it('використовує логін, якщо імені немає', () => {
    expect(getInitials({ login: 'ivan' })).toBe('I');
  });

  it('повертає "?" для порожнього користувача', () => {
    expect(getInitials(null)).toBe('?');
  });
});

describe('pluralize', () => {
  const forms = ['коментар', 'коментарі', 'коментарів'];

  it.each([
    [1, 'коментар'],
    [2, 'коментарі'],
    [5, 'коментарів'],
    [11, 'коментарів'],
    [21, 'коментар'],
    [102, 'коментарі'],
  ])('для %i повертає "%s"', (count, expected) => {
    expect(pluralize(count, forms)).toBe(expected);
  });
});

describe('formatCount', () => {
  it('не змінює числа менші за тисячу', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(999)).toBe('999');
  });

  it('скорочує тисячі та мільйони', () => {
    expect(formatCount(1000)).toBe('1K');
    expect(formatCount(1500)).toBe('1.5K');
    expect(formatCount(2_000_000)).toBe('2M');
  });
});
