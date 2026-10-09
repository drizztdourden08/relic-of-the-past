/* @layer shared-game @kind logic */
import type { OptionValues } from './options.type';

const optionFlagOf = (values: OptionValues, key: string, fallback: boolean): boolean => {
  const value = values[key];
  return typeof value === 'boolean' ? value : fallback;
};

export { optionFlagOf };
