/* @layer shared-game @kind logic */
import { isRecord } from './is-record';
import type { OptionValue } from '../../world/options.type';

const isOptionValue = (value: unknown): value is OptionValue =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

const parseOptions = (raw: unknown): Record<string, OptionValue> | null => {
  if (!isRecord(raw)) return null;
  const options: Record<string, OptionValue> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!isOptionValue(value)) return null;
    options[key] = value;
  }
  return options;
};

export { parseOptions };
