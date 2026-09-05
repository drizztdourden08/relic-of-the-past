/* @layer renderer-components @kind data */
/**
 * A stable glyph per operator icon id; `MenuItem.icon` is plain text. A few
 * ids share a glyph on purpose: `containsValue` reads like `contains`, and the
 * length operators reuse the numeric comparators behind a leading `#`.
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
