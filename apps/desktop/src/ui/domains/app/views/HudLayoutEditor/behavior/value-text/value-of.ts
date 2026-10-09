/* @layer renderer-components @kind logic */
import { exprOf } from './expr-of';
import { isFormulaText } from './is-formula-text';
import { isNumeral } from './is-numeral';
import type { Value } from '@rotp/hud';

const valueOf = (text: string): Value | null => {
  if (isFormulaText(text)) return { from: 'data', expr: exprOf(text) };
  return isNumeral(text) ? Number(text.trim()) : null;
};

export { valueOf };
