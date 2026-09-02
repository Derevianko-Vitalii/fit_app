import {
  validateEmail,
  validateLogin,
  validateLoginForm,
  validatePassword,
  validatePasswordForm,
  validateRegisterForm,
} from './validators';

describe('validateLogin', () => {
  it('вимагає непорожнє значення', () => {
    expect(validateLogin('')).toMatch(/обов/);
  });

  it('забороняє спецсимволи — так само, як бекенд', () => {
    expect(validateLogin('ivan_2000')).toMatch(/латиницю/);
  });

  it('перевіряє довжину 3–10 символів', () => {
    expect(validateLogin('ab')).toMatch(/3 до 10/);
    expect(validateLogin('abcdefghijk')).toMatch(/3 до 10/);
  });

  it('приймає коректний логін', () => {
    expect(validateLogin('ivan2000')).toBe('');
  });
});

describe('validateEmail', () => {
  it('відхиляє некоректний формат', () => {
    expect(validateEmail('not-an-email')).toMatch(/Некоректний/);
  });

  it('приймає коректний email', () => {
    expect(validateEmail('user@example.com')).toBe('');
  });
});

describe('validatePassword', () => {
  it('вимагає 7–30 символів', () => {
    expect(validatePassword('abc12')).toMatch(/7 до 30/);
  });

  it('дозволяє лише латиницю та цифри', () => {
    expect(validatePassword('пароль123')).toMatch(/латиницю/);
  });

  it('приймає коректний пароль', () => {
    expect(validatePassword('secret123')).toBe('');
  });
});

describe('validateLoginForm', () => {
  it('повертає помилки для порожньої форми', () => {
    const errors = validateLoginForm({ loginOrEmail: '', password: '' });

    expect(Object.keys(errors)).toEqual(['loginOrEmail', 'password']);
  });

  it('не повертає помилок для заповненої форми', () => {
    expect(validateLoginForm({ loginOrEmail: 'ivan', password: 'secret123' })).toEqual({});
  });
});

const VALID = {
  firstName: 'Олена',
  lastName: 'Петренко',
  login: 'ivan2000',
  email: 'ivan@example.com',
  password: 'secret123',
  confirmPassword: 'secret123',
};

describe('validateRegisterForm', () => {
  const validForm = VALID;

  it('не знаходить помилок у коректній формі', () => {
    expect(validateRegisterForm(validForm)).toEqual({});
  });

  it('ловить розбіжність паролів', () => {
    const errors = validateRegisterForm({ ...validForm, confirmPassword: 'other123' });

    expect(errors.confirmPassword).toMatch(/не збігаються/);
  });

  it('ловить цифри в імені', () => {
    const errors = validateRegisterForm({ ...validForm, firstName: 'Олена2' });

    expect(errors.firstName).toMatch(/не приймає/);
  });
});

describe('validatePasswordForm', () => {
  it('вимагає поточний пароль', () => {
    const errors = validatePasswordForm({
      password: '',
      newPassword: 'secret123',
      confirmPassword: 'secret123',
    });

    expect(errors.password).toMatch(/поточний/);
  });
});

describe('validateName — межі збігаються з серверними', () => {
  it('приймає імена без специфічно українських літер', () => {
    expect(validateRegisterForm({ ...VALID, firstName: 'Олена' }).firstName).toBeUndefined();
    expect(validateRegisterForm({ ...VALID, lastName: 'Ковальчук' }).lastName).toBeUndefined();
  });

  it.each(['Марія', 'Андрій', 'Ґалина', 'Євген'])(
    'відхиляє «%s» — сервер такі літери не приймає',
    (name) => {
      const errors = validateRegisterForm({ ...VALID, firstName: name });

      expect(errors.firstName).toMatch(/не приймає/);
    }
  );

  it('відхиляє дефіси та апострофи, як і сервер', () => {
    expect(validateRegisterForm({ ...VALID, lastName: "О'Коннор" }).lastName).toMatch(/не приймає/);
    expect(validateRegisterForm({ ...VALID, lastName: 'Нечуй-Левицький' }).lastName).toMatch(
      /не приймає/
    );
  });
});
