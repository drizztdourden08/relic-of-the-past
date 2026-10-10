/* @layer renderer-components @kind logic */
import { exprOf } from './expr-of';
import { isFormulaText } from './is-formula-text';
import { isNumeral } from './is-numeral';
import { literalTextOf } from './literal-text-of';
import type { Value } from '@rotp/hud';

const textValueOf = (text: string): Value | string => {
  if (isFormulaText(text)) return { from: 'data', expr: exprOf(text) };
  const literal = literalTextOf(text);
  return isNumeral(literal) ? Number(literal.trim()) : literal;
};

export { textValueOf };
