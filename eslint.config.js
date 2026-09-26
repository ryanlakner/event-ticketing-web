import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import { configs, plugins, rules } from 'eslint-config-airbnb-extended';
import { rules as prettierConfigRules } from 'eslint-config-prettier';

const gitignorePath = path.resolve('.', '.gitignore');

// Files that run in Node.js rather than the browser.
const nodeFiles = ['scripts/**/*.js', '*.config.js', '*.config.ts'];

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  {
    name: 'project/ignores',
    // Generated from openapi/ticketing-api.v1.json by `npm run api:types`.
    ignores: ['src/api/schema.d.ts'],
  },

  // JavaScript: ESLint recommended + Airbnb base
  { name: 'js/config', ...js.configs.recommended },
  plugins.stylistic,
  plugins.importX,
  ...configs.base.recommended,

  // Node.js: Airbnb's Node rules and globals, only where code runs in Node
  plugins.node,
  ...configs.node.recommended.map((config) => ({ ...config, files: nodeFiles })),

  // React: Airbnb React, hooks, and accessibility rules
  plugins.react,
  plugins.reactHooks,
  plugins.reactA11y,
  ...configs.react.recommended,

  // TypeScript: typescript-eslint + Airbnb TypeScript rules
  plugins.typescriptEslint,
  ...configs.base.typescript,
  ...configs.react.typescript,

  // Airbnb's opt-in strict TypeScript rules: no `any`, no non-null assertions.
  rules.typescript.typescriptEslintStrict,

  {
    name: 'project/typescript-inferred-returns',
    // From the strict add-on, not Airbnb: tsc already infers and checks return types, and
    // annotating TanStack Query hooks would only restate complex library types.
    rules: { '@typescript-eslint/explicit-module-boundary-types': 'off' },
  },
  {
    name: 'project/react-jsx-runtime',
    // The only deviation from Airbnb: these predate React 17's automatic JSX runtime
    // (tsconfig "jsx": "react-jsx"), which no longer needs React in scope.
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
    },
  },

  {
    name: 'project/tests',
    // Tests and their helpers may import test tooling, which lives in devDependencies.
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
    rules: { 'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }] },
  },

  // Prettier owns formatting (see .prettierrc.json), so turn off overlapping style rules.
  { name: 'prettier/config', rules: { ...prettierConfigRules } },
]);
