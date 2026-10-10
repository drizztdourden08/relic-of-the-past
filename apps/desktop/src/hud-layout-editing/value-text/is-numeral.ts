/* @layer renderer-components @kind logic */
import { NUMERAL } from './value-text.constants';

const isNumeral = (text: string): boolean => NUMERAL.test(text.trim());

export { isNumeral };
