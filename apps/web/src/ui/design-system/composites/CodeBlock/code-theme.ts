/* @layer renderer-components @kind data */
/**
 * Prism theme built from this project's own design tokens (color.css /
 * canonical.css) instead of a foreign Prism stylesheet. Each entry's color is
 * the literal CSS custom-property string (e.g. `'var(--c-gold-bright)'`) —
 * prism-react-renderer applies these as inline `style` per token, and the
 * browser resolves the variable at paint time, so a token span stays
 * theme-aware across light/dark exactly the way ordinary component CSS does
 * here (no `getComputedStyle` needed).
 *
 * Prism's token categories don't map 1:1 onto the app's semantic palette, so
 * this groups them onto the closest existing accent: gold for keywords/tags,
 * green for strings, amber (warning) for numeric/boolean literals, blue
 * (info) for names, and the neutral text tiers for everything structural.
 */
import type { PrismTheme } from 'prism-react-renderer';

const CODE_THEME: PrismTheme = {
  plain: {
    color: 'var(--c-text)',
    backgroundColor: 'var(--c-sunken)',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--c-text-muted)', fontStyle: 'italic' },
    },
    {
      types: ['punctuation', 'operator', 'entity', 'url', 'variable'],
      style: { color: 'var(--c-text-dim)' },
    },
    {
      types: ['string', 'char', 'attr-value', 'inserted'],
      style: { color: 'var(--c-green-bright)' },
    },
    {
      types: ['keyword', 'tag', 'builtin', 'atrule', 'important'],
      style: { color: 'var(--c-gold-bright)' },
    },
    {
      types: ['boolean', 'number', 'constant', 'symbol', 'deleted'],
      style: { color: 'var(--c-warning)' },
    },
    {
      types: ['function', 'class-name', 'property', 'attr-name'],
      style: { color: 'var(--c-info)' },
    },
  ],
};

export { CODE_THEME };
