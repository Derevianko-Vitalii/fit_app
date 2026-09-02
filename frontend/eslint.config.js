import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist', 'coverage', 'node_modules'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react/prop-types': 'off',
    },
  },
  {
    files: [
      '**/*.{test,spec}.{js,jsx}',
      'src/setupTests.js',
      'src/setupPolyfills.js',
      'src/__mocks__/**',
      'src/test-utils/**',
    ],
    languageOptions: { globals: { ...globals.jest, ...globals.node } },
  },
  {
    files: ['*.config.js', '*.config.cjs', 'babel.config.cjs', 'jest.config.cjs'],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
];
