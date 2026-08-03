/* @layer renderer-components @kind data */
/**
 * A stable glyph per operator icon id. The design system's Icon primitive has
 * no named glyph set of its own — every existing consumer hand-draws its own
 * SVG path data for a specific button (see WindowControls) — and
 * DropdownMenu's own `MenuItem.icon` is typed as plain text, matching how the
 * rest of the design system already shows an icon as a button's direct
 * content (a Badge or IconButton rendering a check or cross glyph). A short
 * Unicode symbol is that same approach applied to operators.
 *
 * A few ids intentionally share a glyph: there is no symbol distinct enough
 * from `contains` for `containsValue` (array "contains" reads identically to
 * string "contains"), and the three length operators reuse the numeric
 * comparators behind a leading `#` since there is no well-known single glyph
 * for "count of items".
 */
import type { OperatorIcon } from '../../../data/filter/operators';

const OPERATOR_GLYPHS: Record<OperatorIcon, string> = {
  equals: '=',
  'not-equals': '≠',
  greater: '>',
  'greater-eq': '≥',
  less: '<',
  'less-eq': '≤',
  between: '↔',
  contains: '∋',
  'starts-with': '⊢',
  'ends-with': '⊣',
  'is-empty': '∅',
  'is-not-empty': '●',
  'any-of': '∈',
  'none-of': '∉',
  'is-true': '✓',
  'is-false': '✕',
  'length-eq': '#=',
  'length-gt': '#>',
  'length-lt': '#<',
  'contains-value': '∋',
};

const glyphForOperatorIcon = (icon: OperatorIcon): string => OPERATOR_GLYPHS[icon] ?? '?';

export { glyphForOperatorIcon };
