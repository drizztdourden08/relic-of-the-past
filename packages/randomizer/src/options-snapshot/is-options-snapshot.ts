/* @layer shared-game @kind logic */
import { OPTIONS_SCHEMA } from './options-snapshot.constants';
import type { RandomizerOptionsSnapshot } from '../world/options.type';

const isOptionsSnapshot = (raw: unknown): raw is RandomizerOptionsSnapshot => {
  if (!raw || typeof raw !== 'object') return false;
  const candidate = raw as Record<string, unknown>;
  return candidate.schema === OPTIONS_SCHEMA
    && typeof candidate.values === 'object' && candidate.values !== null;
};

export { isOptionsSnapshot };
