/* @layer shared-game @kind logic */
import type { OptionValue } from '../options.type';

const optionNumberOf = (value: OptionValue | undefined): number => {
  if (typeof value === 'number') return value;
  return typeof value === 'string' && value.trim() !== '' ? Number(value) : Number.NaN;
};

export { optionNumberOf };
