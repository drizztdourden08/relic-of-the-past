/* @layer renderer-components @kind logic */
import { FORMULA_PREFIX } from './value-text.constants';

const isFormulaText = (text: string): boolean => text.trimStart().startsWith(FORMULA_PREFIX)
  && !text.trimStart().startsWith(`${FORMULA_PREFIX}${FORMULA_PREFIX}`);

export { isFormulaText };
