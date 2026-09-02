import { decodeToken, getUserIdFromToken, isTokenValid } from './jwt';

/** Збирає підроблений JWT із заданим payload (підпис не перевіряється). */
function makeToken(payload) {
  const encode = (obj) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `Bearer ${encode({ alg: 'HS256' })}.${encode(payload)}.signature`;
}

describe('decodeToken', () => {
  it('розбирає payload токена з префіксом Bearer', () => {
    const token = makeToken({ id: 'abc123', firstName: 'Ivan' });

    expect(decodeToken(token)).toMatchObject({ id: 'abc123', firstName: 'Ivan' });
  });

  it('працює і без префікса Bearer', () => {
    const token = makeToken({ id: 'abc123' }).replace('Bearer ', '');

    expect(decodeToken(token)?.id).toBe('abc123');
  });

  it('повертає null для сміття', () => {
    expect(decodeToken(null)).toBeNull();
    expect(decodeToken('не токен')).toBeNull();
    expect(decodeToken('a.b.c')).toBeNull();
  });
});

describe('isTokenValid', () => {
  it('вважає токен із майбутнім exp дійсним', () => {
    const token = makeToken({ id: '1', exp: Math.floor(Date.now() / 1000) + 3600 });

    expect(isTokenValid(token)).toBe(true);
  });

  it('вважає протермінований токен недійсним', () => {
    const token = makeToken({ id: '1', exp: Math.floor(Date.now() / 1000) - 10 });

    expect(isTokenValid(token)).toBe(false);
  });

  it('вважає токен без exp недійсним', () => {
    expect(isTokenValid(makeToken({ id: '1' }))).toBe(false);
  });
});

describe('getUserIdFromToken', () => {
  it('дістає id користувача', () => {
    expect(getUserIdFromToken(makeToken({ id: 'user-42' }))).toBe('user-42');
  });

  it('повертає null, якщо id немає', () => {
    expect(getUserIdFromToken(makeToken({}))).toBeNull();
  });
});
