/* @layer renderer-lib @kind logic */
import type { StoredPlacement } from './randomizer-placement-io.type';
import { PLACEMENT_SCHEMA } from './randomizer-placement-io.constants';

const isStoredPlacement = (raw: unknown): raw is StoredPlacement => {
  if (!raw || typeof raw !== 'object') return false;
  const candidate = raw as Partial<StoredPlacement>;
  return candidate.schema === PLACEMENT_SCHEMA
    && typeof candidate.locations === 'object' && candidate.locations !== null
    && typeof candidate.stats === 'object' && candidate.stats !== null
    && Array.isArray(candidate.spheres);
};

export { isStoredPlacement };
