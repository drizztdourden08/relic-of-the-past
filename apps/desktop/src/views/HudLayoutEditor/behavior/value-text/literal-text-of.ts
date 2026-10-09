/* @layer renderer-components @kind logic */
import { FORMULA_PREFIX } from './value-text.constants';

const literalTextOf = (text: string): string => (
  text.trimStart().startsWith(`${FORMULA_PREFIX}${FORMULA_PREFIX}`) ? text.trimStart().slice(1) : text
);

export { literalTextOf };
