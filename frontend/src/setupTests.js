import '@testing-library/jest-dom';

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

const originalError = console.error;

beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Помилка рендеру')) return;
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

afterEach(() => {
  window.localStorage.clear();
});
