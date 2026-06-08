/* @layer root-config @kind config */
// Flat ESLint config (ESLint 9). Enforces the project's hard coding standards
// mechanically — see docs/coding-standards.md. Scoped to OUR TypeScript only
// (core/ is vendored C, dist/out/release are build output).
//
// NOTE: existing monolithic files (e.g. NavigationWidget.tsx) will report
// violations here — that is expected. Policy is "refactor when touched"; the
// PostToolUse hook (scripts/hooks/lint-changed.mjs) enforces on the file you edit.

import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

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
      'react-hooks': reactHooks,
    },
    rules: {
      // ── File-size cap is owned solely by the per-kind line-policy ──
      // (scripts/analyze/policy.mjs). ESLint's flat `max-lines` is intentionally
      // NOT used here: it can't see @layer/@kind, so it disagreed with the policy
      // on tests (cap 300), style, and data files. One source of truth = line-policy.

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

      // ── React hooks correctness ──
      // rules-of-hooks (real hook-ordering bugs) stays an error.
      // exhaustive-deps is OFF: every one of its findings here was an intentional
      // pattern (mount-only effects, stable refs/setters, the deps-object handler
      // pattern in useCalibrationActions) — never a real bug, and with no runtime
      // tests, auto-adding deps risks render loops. Deps are managed by hand.
      // Re-enable as 'warn' anytime if you want the advisory back.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
);
