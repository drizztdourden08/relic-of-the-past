/* @layer renderer-components @kind logic */
import { isNumeral } from './is-numeral';

const stepsAsNumber = (text: string): boolean => isNumeral(text);

export { stepsAsNumber };
