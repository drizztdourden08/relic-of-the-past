/* @layer shared-game @kind logic */
import { baselineValues, optionByKey } from '../world/options';
import { OPTIONS_SCHEMA } from './options-snapshot.constants';
import type { OptionValue, OptionValues, RandomizerOptionsSnapshot } from '../world/options.type';

const buildOptionsSnapshot = (
  overrides: OptionValues = {},
): RandomizerOptionsSnapshot => {
  const values: Record<string, OptionValue> = { ...baselineValues };
  for (const [key, value] of Object.entries(overrides)) {
    const option = optionByKey.get(key);
    if (option && !option.locked) values[key] = value;
  }
  return { schema: OPTIONS_SCHEMA, values };
};

export { buildOptionsSnapshot };
