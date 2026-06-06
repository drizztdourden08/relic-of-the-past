// Flat ESLint config (ESLint 9). Enforces the project's hard coding standards
// mechanically — see docs/coding-standards.md. Scoped to OUR TypeScript only
// (core/ is vendored C, dist/out/release are build output).
//
// NOTE: existing monolithic files (e.g. NavigationWidget.tsx) will report
// violations here — that is expected. Policy is "refactor when touched"; the
// PostToolUse hook (scripts/hooks/lint-changed.mjs) enforces on the file you edit.

import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'out/**',
      'release/**',
      'core/**',
      'apps/desktop/public/**',
      'playwright-report/**',
      'test-results/**',
      'tests/test-results/**',
      'tests/screenshots/**',
      'temp-scripts/**',
      'scripts/hooks/**',
      '**/*.d.ts',
      '**/*.config.{js,ts,cjs,mjs}',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // ── Hard file-size cap: split before exceeding 200 lines of code ──
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],

      // ── Arrow functions only: no `function foo() {}` declarations ──
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],

      // ── Exports grouped at end: no inline `export const/function/type` ──
      // Re-exports in barrels (`export { X } from './X'`) have no `declaration`
      // node, so they are NOT flagged.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportNamedDeclaration[declaration]',
          message:
            'No inline export. Declare locally, then group `export { ... }` / `export type { ... }` at the END of the file.',
        },
      ],

      // ── Type-only imports must use `import type` ──
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
    },
  },
);
