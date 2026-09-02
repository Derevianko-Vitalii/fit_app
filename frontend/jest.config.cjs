/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['<rootDir>/src/setupPolyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {

    '^@/config/env$': '<rootDir>/src/__mocks__/envMock.js',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp|woff2?)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/**/*.{test,spec}.{js,jsx}'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/**/*.{test,spec}.{js,jsx}',
    '!src/__mocks__/**',
  ],
};
