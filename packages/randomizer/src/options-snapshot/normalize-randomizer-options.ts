/* @layer shared-game @kind logic */
import { baselineValues } from '../world/options';
import { buildOptionsSnapshot } from './build-options-snapshot';
import { isOptionsSnapshot } from './is-options-snapshot';
import { OPTIONS_SCHEMA } from './options-snapshot.constants';
import type { RandomizerOptionsSnapshot } from '../world/options.type';

const normalizeRandomizerOptions = (raw: unknown): RandomizerOptionsSnapshot =>
  (isOptionsSnapshot(raw)
    ? { schema: OPTIONS_SCHEMA, values: { ...baselineValues, ...raw.values } }
    : buildOptionsSnapshot());

export { normalizeRandomizerOptions };
