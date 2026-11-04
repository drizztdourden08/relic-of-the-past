/* @layer shared-game @kind logic */
import { isOptionsSnapshot } from '@drizztdourden08/brock-randomizer/world';
import { baselineValues } from '../world/options';
import { buildOptionsSnapshot } from './build-options-snapshot';
import { OPTIONS_SCHEMA, OPTION_SCHEMAS } from './options-snapshot.constants';
import type { RandomizerOptionsSnapshot } from '../world/options.type';

const normalizeRandomizerOptions = (raw: unknown): RandomizerOptionsSnapshot =>
  (isOptionsSnapshot<RandomizerOptionsSnapshot>(raw, OPTION_SCHEMAS)
    ? { schema: OPTIONS_SCHEMA, values: { ...baselineValues, ...raw.values } }
    : buildOptionsSnapshot());

export { normalizeRandomizerOptions };
