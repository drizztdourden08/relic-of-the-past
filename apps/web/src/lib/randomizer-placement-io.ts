/* @layer renderer-lib @kind logic */
/**
 * Typed wrapper around the per-profile randomizer-placement store
 * (profiles/<id>/randomizer.json). Writes the Placement under an explicit schema stamp and reads
 * back only a file under that same stamp. Callers get a Placement or null, never a half-parsed
 * blob. A file under any other stamp reads as absent, so the caller generates a fresh seed.
 *
 * NO MIGRATION, AND NO KEY MAP. A placement whose shape or keys change is a clean break: the
 * stamp is bumped, and a file under any earlier stamp reads as absent.
 */
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import { loadRandomizerState, saveRandomizerState } from './storage/profile-data-store';

/** Bumped whenever the placement's shape or its location keys change. */
const PLACEMENT_SCHEMA = 'placement-v6';

type StoredPlacement = Placement & { schema: typeof PLACEMENT_SCHEMA };

const isStoredPlacement = (raw: unknown): raw is StoredPlacement => {
  if (!raw || typeof raw !== 'object') return false;
  const candidate = raw as Partial<StoredPlacement>;
  return candidate.schema === PLACEMENT_SCHEMA
    && typeof candidate.locations === 'object' && candidate.locations !== null
    && typeof candidate.stats === 'object' && candidate.stats !== null
    && Array.isArray(candidate.spheres);
};

const loadRandomizerPlacement = async (profileId: string): Promise<Placement | null> => {
  const raw = await loadRandomizerState(profileId);
  if (!isStoredPlacement(raw)) return null;
  const { schema: _schema, ...placement } = raw;
  return placement;
};

const saveRandomizerPlacement = async (profileId: string, placement: Placement): Promise<void> => {
  const stored: StoredPlacement = { schema: PLACEMENT_SCHEMA, ...placement };
  await saveRandomizerState(profileId, stored);
};

export { PLACEMENT_SCHEMA, loadRandomizerPlacement, saveRandomizerPlacement };
