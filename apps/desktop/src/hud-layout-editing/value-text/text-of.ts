/* @layer renderer-components @kind logic */
import { FORMULA_PREFIX } from './value-text.constants';
import type { Value } from '@rotp/hud';

const textOf = (value: Value | undefined): string => {
  if (value === undefined) return '';
  return typeof value === 'number' ? String(value) : `${FORMULA_PREFIX} ${value.expr}`;
};

export { textOf };
