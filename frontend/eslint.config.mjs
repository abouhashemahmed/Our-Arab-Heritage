// eslint.config.mjs
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import securityPlugin from 'eslint-plugin-security';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import promise from 'eslint-plugin-promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: true,
});

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // ✅ Next.js Rules
  {
    files: ['app/**/*.tsx', 'pages/**/*.tsx'],
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-sync-scripts': 'error',
    },
  },

  // ✅ React & A11y
  {
    plugins: { react: reactPlugin, 'jsx-a11y': jsxA11y },
    settings: {
      react: { version: 'detect', runtime: 'automatic' },
    },
    rules: {
      'react/jsx-props-no-spreading': 'off',
      'react/react-in-jsx-scope': 'off',
      'jsx-a11y/anchor-is-valid': 'warn',
    },
  },

  // ✅ TypeScript
  ...compat.config({
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: __dirname,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: false }],
    },
  }),

  // ✅ Security
  {
    plugins: { security: securityPlugin },
    rules: {
      'security/detect-possible-timing-attacks': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
    },
  },

  // ✅ Promises
  {
    plugins: { promise },
    rules: {
      'promise/always-return': 'warn',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
    },
  },

  // ✅ Airbnb + Prettier
  ...compat.extends('airbnb', 'prettier'),

  // ✅ Base + Custom Rules
  {
    ignores: ['.next/', 'dist/', 'node_modules/'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { React: 'readonly', JSX: 'readonly' },
    },
    plugins: { import: importPlugin },
    rules: {
      'import/prefer-default-export': 'off',
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      }],
      'prettier/prettier': 'error',
    },
  },

  // ✅ Security overrides for internal config files
  {
    files: ['next.config.js', 'sentry.*.config.js'],
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
    },
  }
];
