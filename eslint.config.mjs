import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextRules = {
  ...nextPlugin.configs.recommended.rules,
  ...nextPlugin.configs['core-web-vitals'].rules,
};
const tsRecommendedRules = tsPlugin.configs.recommended.rules;

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/next-env.d.ts',
      '**/*.js',
      '**/*.cjs',
    ],
  },

  {
    plugins: {
      '@next/next': nextPlugin,
    },
    settings: {
      next: {
        rootDir: 'frontend/',
      },
    },
    rules: {},
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: rootDir,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsRecommendedRules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'no-duplicate-imports': 'error',
      'no-undef': 'off',
    },
  },

  {
    files: ['frontend/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...nextRules,
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  {
    files: ['backend/**/*.ts', 'shared/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    files: ['backend/**/*.ts'],
    rules: {
      'no-console': 'error',
    },
  },

  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
];
