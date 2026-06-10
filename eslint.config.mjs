/* @layer root-config @kind config */
// Flat ESLint config (ESLint 9). Enforces the project's hard coding standards
// mechanically — see docs/contributing/coding-standards.md. Scoped to OUR TypeScript only
// (core/ is vendored C, dist/out/release are build output).
//
// NOTE: existing monolithic files (e.g. NavigationWidget.tsx) will report
// violations here — that is expected. Policy is "refactor when touched"; the
// PostToolUse hook (scripts/hooks/lint-changed.mjs) enforces on the file you edit.

import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

// ── R11: no raw HTML outside primitives (warn — work toward error) ──
// Any lowercase JSX element is an intrinsic HTML tag; PascalCase = a component.
// Compose a design-system primitive (Box/Text/Flex/Button/…) instead. The
// primitives/ override turns this off (raw HTML is allowed there).
const noRawHtml = {
  meta: { type: 'problem', docs: { description: 'No raw HTML elements outside primitives' }, schema: [] },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const n = node.name;
        if (n.type === 'JSXIdentifier' && /^[a-z]/.test(n.name)) {
          context.report({ node, message: `No raw <${n.name}> outside primitives — use a design-system primitive (Box/Text/Flex/Button/…).` });
        }
      },
    };
  },
};

// ── R14: no raw color literals in inline-style objects (use design tokens) ──
// Flags a hex/rgb()/rgba()/hsl() string assigned to a color-ish style property
// (color, background, borderColor, fill, stroke, boxShadow, …). Use a token:
// `var(--c-*)`. Targets object Properties only, so canvas `ctx.fillStyle = '#fff'`
// (an assignment, not a property) and dynamic `color: cond ? a : b` / fn() values
// are NOT flagged — those are the legitimate canvas / categorical exceptions.
const COLOR_KEYS = /^(color|background|backgroundColor|border|borderColor|borderTopColor|borderBottomColor|borderLeftColor|borderRightColor|outline|outlineColor|fill|stroke|boxShadow|textShadow|caretColor|accentColor|columnRuleColor|textDecorationColor)$/;
const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|hwb)\(/;
const noRawColor = {
  meta: { type: 'problem', docs: { description: 'No raw color literals in inline styles — use design tokens' }, schema: [] },
  create(context) {
    return {
      Property(node) {
        const key = node.key;
        const name = key.type === 'Identifier' ? key.name : (key.type === 'Literal' ? String(key.value) : '');
        if (!COLOR_KEYS.test(name)) return;
        const v = node.value;
        if (v.type === 'Literal' && typeof v.value === 'string' && RAW_COLOR.test(v.value)) {
          context.report({ node: v, message: `No raw color '${v.value}' in an inline style — use a design token, e.g. 'var(--c-*)'.` });
        }
      },
    };
  },
};

// ── no `as="<tag>"` when a design-system primitive exists ──
// `<Box as="button">` (and friends) re-roll a primitive that already exists.
// Compose the primitive instead. Allowed inside primitives (they implement `as`).
const AS_PRIMITIVE = {
  button: 'Button / IconButton',
  input: 'TextInput / NumberInput / Checkbox / RangeInput',
  select: 'Select',
  textarea: 'TextArea',
  img: 'Image',
};
const noAsElementWithPrimitive = {
  meta: { type: 'problem', docs: { description: 'No `as="<tag>"` when a design-system primitive exists' }, schema: [] },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name?.name !== 'as') return;
        const v = node.value;
        if (!v || v.type !== 'Literal' || typeof v.value !== 'string') return;
        const prim = AS_PRIMITIVE[v.value];
        if (prim) {
          context.report({ node, message: `No \`as="${v.value}"\` — a primitive exists; use ${prim} instead of re-rolling a raw <${v.value}>.` });
        }
      },
    };
  },
};

// ── no fully-static inline style objects (use token-backed CSS) ──
// Inline `style={{…}}` is only for DYNAMIC/animated/computed values. A style
// object whose every value is a static literal belongs in a CSS class backed by
// design tokens. Spreads / member exprs / template literals / conditionals / calls
// count as dynamic and are NOT flagged (the legitimate animation/manipulation case).
const isStaticStyleValue = (n) => {
  if (!n) return false;
  if (n.type === 'Literal') return true;
  if (n.type === 'UnaryExpression') return n.argument.type === 'Literal'; // -1, +2
  return false;
};
const noStaticInlineStyle = {
  meta: { type: 'problem', docs: { description: 'No fully-static inline style — move to token-backed CSS' }, schema: [] },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name?.name !== 'style') return;
        const expr = node.value && node.value.type === 'JSXExpressionContainer' ? node.value.expression : null;
        if (!expr || expr.type !== 'ObjectExpression' || expr.properties.length === 0) return;
        const allStatic = expr.properties.every((p) => p.type === 'Property' && isStaticStyleValue(p.value));
        if (allStatic) {
          context.report({ node, message: 'No static inline style — move these values to a token-backed CSS class. Inline style is only for dynamic/animated/computed values.' });
        }
      },
    };
  },
};

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
      local: { rules: { 'no-raw-html': noRawHtml, 'no-raw-color': noRawColor, 'no-as-element-with-primitive': noAsElementWithPrimitive, 'no-static-inline-style': noStaticInlineStyle } },
    },
    rules: {
      // ── R11: raw HTML only in primitives (warn — work toward error) ──
      'local/no-raw-html': 'warn',

      // ── R14: no raw color literals in inline styles (error) ──
      'local/no-raw-color': 'error',

      // ── no `as="<tag>"` when a primitive exists (error) ──
      // All ~159 `<Box as="button">` / etc. sites migrated to Button/Image/…;
      // promoted to error to prevent regressions.
      'local/no-as-element-with-primitive': 'error',

      // ── no fully-static inline styles (error) ──
      // Inline style is for dynamic/animation/computed values only; static values
      // belong in a token-backed CSS class / style const. All sites migrated →
      // promoted to error to prevent regressions.
      'local/no-static-inline-style': 'error',

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
        // ── Raw HTML form controls are allowed ONLY in primitives ──
        // Everywhere else, compose the design-system primitive. (The
        // primitives/ override below re-allows them.) Bespoke <button>s are not
        // yet banned — that's a documented follow-up once they're migrated.
        {
          selector: "JSXOpeningElement[name.name='input']",
          message: 'No raw <input> outside primitives — use TextInput / NumberInput / Checkbox / RangeInput.',
        },
        {
          selector: "JSXOpeningElement[name.name='select']",
          message: 'No raw <select> outside primitives — use Select / NativeSelect.',
        },
        {
          selector: "JSXOpeningElement[name.name='textarea']",
          message: 'No raw <textarea> outside primitives — add a TextArea primitive instead.',
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
  {
    // ── no-raw-color exceptions (documented) ──
    // Categorical data-viz palettes: fixed, distinct hues that ENCODE categories
    // (requirement icons, HID byte roles) — not theme colors, like chart palettes.
    // DebugWidget: a deliberate retro green-on-black terminal. HUD: SNES palette.
    files: [
      '**/ui/domains/widgets/navigation/sub-components/ReqIcon.tsx',
      '**/ui/domains/app/views/InputTester/sub-components/hid-calibration/components/ByteGrid.tsx',
      '**/ui/domains/app/views/InputTester/sub-components/hid-calibration/wizard-helpers.ts',
      '**/ui/domains/app/views/InputTester/sub-components/GamepadCard.tsx',
      '**/ui/domains/app/views/SpriteDebug/sub-components/ReviewCards.tsx',
      '**/ui/domains/widgets/debug/DebugWidget.tsx',
      '**/ui/domains/hud/**/*.{ts,tsx}',
      'apps/desktop/electron/**/*.{ts,tsx}',
    ],
    rules: { 'local/no-raw-color': 'off' },
  },
  {
    // ── HUD is a CSS-rule exception (SNES reproduction) ──
    // The HUD reproduces the original in-game interface pixel-for-pixel using the
    // exact SNES palette and layout; its styling is game-accurate, not part of the
    // design-token system, so static inline styles are legitimate here (alongside
    // the no-raw-color exemption above and the stylelint HUD override). Component-
    // composition rules (no-raw-html / no-as-element-with-primitive) are NOT CSS
    // rules and are intentionally left in force outside hud/primitives/.
    files: ['**/ui/domains/hud/**/*.{ts,tsx}'],
    rules: { 'local/no-static-inline-style': 'off' },
  },
  {
    // ── Primitives are the ONE place raw HTML is allowed ──
    // Re-allow raw form controls here; keep the inline-export ban.
    files: ['**/ui/design-system/primitives/**/*.tsx', '**/ui/domains/hud/primitives/**/*.tsx'],
    rules: {
      'local/no-raw-html': 'off',
      // Primitives implement `as` and forward `style` — the two rules don't apply here.
      'local/no-as-element-with-primitive': 'off',
      'local/no-static-inline-style': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportNamedDeclaration[declaration]',
          message:
            'No inline export. Declare locally, then group `export { ... }` / `export type { ... }` at the END of the file.',
        },
      ],
    },
  },
);
