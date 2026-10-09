/* @layer renderer-components @kind logic */
import { FORMULA_PREFIX } from './value-text.constants';

const exprOf = (text: string): string => text.trimStart().slice(FORMULA_PREFIX.length).trim();

export { exprOf };
