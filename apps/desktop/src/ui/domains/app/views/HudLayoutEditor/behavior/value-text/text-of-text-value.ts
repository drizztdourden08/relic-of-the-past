/* @layer renderer-components @kind logic */
import { textOf } from './text-of';
import { FORMULA_PREFIX } from './value-text.constants';
import type { Value } from '@rotp/hud';

const textOfTextValue = (value: Value | string): string => {
  if (typeof value !== 'string') return textOf(value);
  return value.startsWith(FORMULA_PREFIX) ? `${FORMULA_PREFIX}${value}` : value;
};

export { textOfTextValue };
