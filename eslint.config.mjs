import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Toastify: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
    ignores: ['misc_dev_stuff/**'],
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { files: ['public/**/*.js'], languageOptions: { sourceType: 'module' } },
]);
