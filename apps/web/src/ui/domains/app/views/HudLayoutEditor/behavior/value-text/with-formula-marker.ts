/* @layer renderer-components @kind logic */
import { isFormulaText } from './is-formula-text';
import { FORMULA_PREFIX } from './value-text.constants';

const withFormulaMarker = (text: string): string => (
  isFormulaText(text) ? text : `${FORMULA_PREFIX} ${text.trim()}`
);

export { withFormulaMarker };
