import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  globalIgnores([
    'dist', 
    'coverage', 
    'node_modules', 
    'vite.config.*', 
    'vitest.config.*', 
    'eslint.config.*',
    'playwright.config.*',
    '*.gen.ts',
  ]),

  {
    files: ['src/**/*.{ts,tsx}'], 
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],

      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_', 
          varsIgnorePattern: '^_' 
        },
      ],
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: ['Redirect'],
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/require-await': 'error',
    },
  },

  {
    files: ['e2e/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      eslintConfigPrettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.e2e.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      
      // Keep your unsafe rule relaxations right here
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'no-empty-pattern': 'off',
    },
  },

  {
    files: ['src/routes/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  {
    files: ['src/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]);