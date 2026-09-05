/* @layer root-config @kind config */
// Enforces docs/contributing/coding-standards.md on our TypeScript only (core/ is
// vendored C; dist/out/release are build output). Legacy monolithic files still
// report violations: policy is "refactor when touched", enforced per edited file
// by scripts/hooks/lint-changed.mjs.

import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import { DEFAULT_ALLOW, findSlop } from './scripts/lint/slop-patterns.mjs';

// R11: no raw HTML outside primitives (warn, work toward error). Lowercase JSX
// element = intrinsic tag. The primitives/ override turns this off.
const noRawHtml = {
  meta: { type: 'problem', docs: { description: 'No raw HTML elements outside primitives' }, schema: [] },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const n = node.name;
        if (n.type === 'JSXIdentifier' && /^[a-z]/.test(n.name)) {
          context.report({ node, message: `No raw <${n.name}> outside primitives. Use a design-system primitive (Box/Text/Flex/Button/...).` });
        }
      },
    };
  },
};

// R14: no raw color literals in inline-style objects. Targets object Properties
// only, so canvas `ctx.fillStyle = '#fff'` (an assignment) and dynamic values
// (`cond ? a : b`, fn()) are not flagged: those are the legitimate exceptions.
const COLOR_KEYS = /^(color|background|backgroundColor|border|borderColor|borderTopColor|borderBottomColor|borderLeftColor|borderRightColor|outline|outlineColor|fill|stroke|boxShadow|textShadow|caretColor|accentColor|columnRuleColor|textDecorationColor)$/;
const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|hwb)\(/;
const noRawColor = {
  meta: { type: 'problem', docs: { description: 'Use design tokens, not raw color literals, in inline styles' }, schema: [] },
  create(context) {
    return {
      Property(node) {
        const key = node.key;
        const name = key.type === 'Identifier' ? key.name : (key.type === 'Literal' ? String(key.value) : '');
        if (!COLOR_KEYS.test(name)) return;
        const v = node.value;
        if (v.type === 'Literal' && typeof v.value === 'string' && RAW_COLOR.test(v.value)) {
          context.report({ node: v, message: `No raw color '${v.value}' in an inline style. Use a design token, e.g. 'var(--c-*)'.` });
        }
      },
    };
  },
};

// No `as="<tag>"` when a primitive exists. Allowed inside primitives (they implement `as`).
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
          context.report({ node, message: `No \`as="${v.value}"\`: a primitive exists. Use ${prim} instead of re-rolling a raw <${v.value}>.` });
        }
      },
    };
  },
};

// No fully-static inline style objects. Spreads, member exprs, template literals,
// conditionals and calls count as dynamic and are not flagged.
const isStaticStyleValue = (n) => {
  if (!n) return false;
  if (n.type === 'Literal') return true;
  if (n.type === 'UnaryExpression') return n.argument.type === 'Literal'; // -1, +2
  return false;
};
const noStaticInlineStyle = {
  meta: { type: 'problem', docs: { description: 'Move fully-static inline styles to token-backed CSS' }, schema: [] },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name?.name !== 'style') return;
        const expr = node.value && node.value.type === 'JSXExpressionContainer' ? node.value.expression : null;
        if (!expr || expr.type !== 'ObjectExpression' || expr.properties.length === 0) return;
        const allStatic = expr.properties.every((p) => p.type === 'Property' && isStaticStyleValue(p.value));
        if (allStatic) {
          context.report({ node, message: 'No static inline style. Move these values to a token-backed CSS class; inline style is only for dynamic/animated/computed values.' });
        }
      },
    };
  },
};

// AI-writing gate. Three rules over comments, string/template literals and JSX
// text. Patterns and messages live in scripts/lint/slop-patterns.mjs, shared with
// the markdownlint rules and the analyze harness so all three agree.
//
// NONE of these is fixable, and that is the point: a mechanical character swap
// (em dash to a colon, "utilize" to "use") keeps the AI sentence shape and is the
// failure mode being blocked. Every report has to be rewritten by hand.
//
// Escape hatch: `// eslint-disable-next-line local/no-em-dash` (and the other two
// ids) works as usual. A domain term that is never slop belongs in SLOP_ALLOW.
const SLOP_ALLOW = [
  ...DEFAULT_ALLOW, // navigate/navigation, harness, unlock, underscore, enhanced
  // Add project words here. A lowercase entry matches any casing; an entry with a
  // capital matches only that casing, so a word can be a name here and still fail
  // in ordinary prose.
];

// Functional comments: never prose, never rewritten.
const DIRECTIVE_COMMENT = /^\s*(eslint\b|eslint-|globals?\b|exported\b|@ts-|prettier-|istanbul\b|c8\b|v8\b|@jsx\b|#!)/;
const SLOP_SCHEMA = [{
  type: 'object',
  properties: { allow: { type: 'array', items: { type: 'string' } } },
  additionalProperties: false,
}];

const slopRule = (group, description) => ({
  meta: { type: 'problem', docs: { description }, schema: SLOP_SCHEMA },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const allow = context.options?.[0]?.allow ?? DEFAULT_ALLOW;
    const scan = (start, text) => {
      for (const hit of findSlop(text, { allow, groups: [group] })) {
        const at = start + hit.index;
        context.report({
          loc: { start: sourceCode.getLocFromIndex(at), end: sourceCode.getLocFromIndex(at + hit.length) },
          message: hit.message,
        });
      }
    };
    const isModuleSpecifier = (node) => {
      const p = node.parent?.type;
      return p === 'ImportDeclaration' || p === 'ExportNamedDeclaration' || p === 'ExportAllDeclaration' || p === 'ImportExpression' || p === 'ImportAttribute';
    };
    return {
      Program() {
        const text = sourceCode.getText();
        for (const c of sourceCode.getAllComments()) {
          if (DIRECTIVE_COMMENT.test(c.value)) continue;
          scan(c.range[0], text.slice(c.range[0], c.range[1]));
        }
      },
      Literal(node) {
        if (typeof node.value !== 'string' || isModuleSpecifier(node)) return;
        // A one-token string is a code value (union member, key, id, class name),
        // never a sentence, so the prose rules have nothing to say about it.
        // Punctuation still applies: a dash or curly quote there is a real bug.
        if (group === 'prose' && /^[\w.:/-]*$/.test(node.value)) return;
        scan(node.range[0], sourceCode.getText(node));
      },
      TemplateElement(node) { scan(node.range[0], sourceCode.getText(node)); },
      JSXText(node) { scan(node.range[0], sourceCode.getText(node)); },
    };
  },
});

const noEmDash = slopRule('dash', 'No em dash or en dash: rewrite the sentence');
const noSmartPunctuation = slopRule('punct', 'No unicode ellipsis or curly quotes');
const noSlopProse = slopRule('prose', 'No AI-writing phrases, connectors, slop words or filler adverbs');

const LOCAL_RULES = {
  'no-raw-html': noRawHtml,
  'no-raw-color': noRawColor,
  'no-as-element-with-primitive': noAsElementWithPrimitive,
  'no-static-inline-style': noStaticInlineStyle,
  'no-em-dash': noEmDash,
  'no-smart-punctuation': noSmartPunctuation,
  'no-slop-prose': noSlopProse,
};

const SLOP_RULES = {
  'local/no-em-dash': ['error', { allow: SLOP_ALLOW }],
  'local/no-smart-punctuation': ['error', { allow: SLOP_ALLOW }],
  'local/no-slop-prose': ['error', { allow: SLOP_ALLOW }],
};

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'out/**',
      'release/**',
      'core/**',
      'third_party/**',
      'apps/web/public/**',
      'apps/mobile/android/**',
      'playwright-report/**',
      'test-results/**',
      'tests/test-results/**',
      'tests/screenshots/**',
      'temp-scripts/**',
      'scripts/hooks/**',
      '**/*.d.ts',
      '**/*.config.{js,ts,cjs,mjs}',
      // Rendered from the private claude-config repo at its remote HEAD, so an
      // edit here is dropped by the next render. Fix it in that repo instead.
      // The private-vault paths are NOT excluded: they are linted and fixed here,
      // then pushed back to the vault.
      '.claude/**',
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
      local: { rules: LOCAL_RULES },
    },
    rules: {
      ...SLOP_RULES,

      // R11: raw HTML only in primitives (warn, work toward error).
      'local/no-raw-html': 'warn',
      'local/no-raw-color': 'error',
      'local/no-as-element-with-primitive': 'error',
      'local/no-static-inline-style': 'error',

      // No `max-lines` here: it cannot see @layer/@kind, so the per-kind cap lives
      // in scripts/analyze/policy.mjs (line-policy) alone.

      'func-style': ['error', 'expression', { allowArrowFunctions: true }],

      // Exports grouped at end. Barrel re-exports have no `declaration` node, so
      // they are not flagged.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportNamedDeclaration[declaration]',
          message:
            'No inline export. Declare locally, then group `export { ... }` / `export type { ... }` at the END of the file.',
        },
        // Raw form controls only in primitives (re-allowed by the override below).
        // Custom <button>s are not yet banned; that follows once they are migrated.
        {
          selector: "JSXOpeningElement[name.name='input']",
          message: 'No raw <input> outside primitives. Use TextInput / NumberInput / Checkbox / RangeInput.',
        },
        {
          selector: "JSXOpeningElement[name.name='select']",
          message: 'No raw <select> outside primitives. Use Select / NativeSelect.',
        },
        {
          selector: "JSXOpeningElement[name.name='textarea']",
          message: 'No raw <textarea> outside primitives. Add a TextArea primitive instead.',
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],

      // exhaustive-deps is off: every finding here was an intentional pattern
      // (mount-only effects, stable refs/setters, the deps-object handler in
      // useCalibrationActions), and auto-adding deps risks render loops.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    // no-raw-color exceptions: categorical palettes that encode categories
    // (requirement icons, HID byte roles), DebugWidget's retro terminal, HUD's SNES palette.
    files: [
      '**/ui/domains/widgets/navigation/sub-components/ReqIcon.tsx',
      '**/ui/domains/app/views/InputTester/sub-components/hid-calibration/components/ByteGrid.tsx',
      '**/ui/domains/app/views/InputTester/sub-components/hid-calibration/wizard-helpers.ts',
      '**/ui/domains/app/views/SpriteDebug/sub-components/ReviewCards.tsx',
      '**/ui/domains/widgets/debug/DebugWidget.tsx',
      '**/ui/domains/hud/**/*.{ts,tsx}',
      'apps/desktop/electron/**/*.{ts,tsx}',
    ],
    rules: { 'local/no-raw-color': 'off' },
  },
  {
    // HUD reproduces the in-game interface pixel-for-pixel with the SNES palette,
    // so static inline styles are legitimate there. Composition rules
    // (no-raw-html / no-as-element-with-primitive) stay in force outside hud/primitives/.
    files: ['**/ui/domains/hud/**/*.{ts,tsx}'],
    rules: { 'local/no-static-inline-style': 'off' },
  },
  {
    // Primitives are the one place raw HTML is allowed; the inline-export ban stays.
    files: ['**/ui/design-system/primitives/**/*.tsx', '**/ui/domains/hud/primitives/**/*.tsx'],
    rules: {
      'local/no-raw-html': 'off',
      // Primitives implement `as` and forward `style`, so these two do not apply.
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
  {
    // Plain JS/MJS (tooling scripts, hooks, generators) gets the writing gate only.
    // The TS composition and structure rules stay off here on purpose.
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: { sourceType: 'module', ecmaVersion: 'latest' },
    plugins: { local: { rules: LOCAL_RULES } },
    rules: SLOP_RULES,
  },
  {
    // The gate's own word lists live here, so it cannot lint itself.
    files: ['scripts/lint/**'],
    rules: { 'local/no-em-dash': 'off', 'local/no-smart-punctuation': 'off', 'local/no-slop-prose': 'off' },
  },
  {
    // Transcribed game text: the alphabet and compression dictionary hold the
    // characters the ROM itself encodes, so an ellipsis here is data. Editing one
    // breaks the decode/encode round-trip. Prose rules still apply to the comments.
    files: ['shared/asset-extraction/text/data/**'],
    rules: { 'local/no-smart-punctuation': 'off' },
  },
);
