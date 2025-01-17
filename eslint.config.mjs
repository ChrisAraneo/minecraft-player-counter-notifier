import eslint from '@eslint/js';
import eslintPluginJsonc from 'eslint-plugin-jsonc';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'jsonc/no-comments': 'error',
      'jsonc/sort-keys': 'error',
    },
  },
  {
    ignores: [
      'node_modules/',
      '.git/',
      'reports/',
      '.stryker-tmp/',
      'package.json',
      'package-lock.json',
      'packages/**/package.json',
      'packages/**/package-lock.json',
    ],
  },
);
