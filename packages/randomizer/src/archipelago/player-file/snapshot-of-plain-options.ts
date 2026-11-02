/* @layer shared-game @kind logic */
import { OPTIONS_SCHEMA } from '../../options-snapshot/options-snapshot.constants';
import { baselineValues, optionByKey } from '../../world/options';
import { plainOptionValue } from './plain-option-value';
import type { OptionValue, RandomizerOptionsSnapshot } from '../../world/options.type';

const snapshotOfPlainOptions = (plain: Readonly<Record<string, unknown>> = {}): RandomizerOptionsSnapshot => {
  const unknown = Object.keys(plain).filter((key) => !optionByKey.has(key));
  if (unknown.length > 0) {
    const valid = [...optionByKey.keys()].sort().join(', ');
    throw new Error(`Unknown option${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}. Valid options: ${valid}.`);
  }
  const values: Record<string, OptionValue> = { ...baselineValues };
  for (const [key, raw] of Object.entries(plain)) {
    const option = optionByKey.get(key);
    if (option !== undefined) values[key] = plainOptionValue(option, raw);
  }
  return { schema: OPTIONS_SCHEMA, values };
};

export { snapshotOfPlainOptions };
