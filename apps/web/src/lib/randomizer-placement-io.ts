/* @layer renderer-lib @kind logic */
/**
 * Typed wrapper around the per-profile randomizer-placement store
 * (profiles/<id>/randomizer.json). Writes the v4 shape, the Placement under an explicit schema
 * stamp, and reads two generations back as a Placement: a v4 file loads directly, and a v1
 * LegacyPlacement, which already stored dataset check and item ids, is lifted through the
 * adapter so the oldest profiles keep playing. Callers get a Placement or null, never a
 * half-parsed blob. A file under any other stamp reads as absent, so the caller generates a
 * fresh seed.
 *
 * NO MIGRATION, AND NO KEY MAP. A placement is keyed by id, so nothing in it can go stale
 * from a relabel; what it cannot survive is a change of the keys themselves. The stamp is
 * bumped instead, and a file under any earlier stamp reads as absent.
 */
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { LegacyPlacement } from '@shared/randomizer/placement.type';
import { adaptLegacyPlacement } from './game/randomizer-client/legacy-placement';
import { loadRandomizerState, saveRandomizerState } from './storage/profile-data-store';

/**
 * Bumped whenever the location keys change: v3 stopped keying by NAME, v4 keyed a shop purchase
 * by shop, shelf and purchase (`kakariko-shop-shelf_left-slot_1`) instead of by the shelf's check
 * id, and v5 moved the flute and floodgate slots onto their story events ("Weathervane opened",
 * "Floodgate lever pulled"). An older file names slots this build does not have, so the honest
 * reading is that it is not a placement for this build and the caller generates a fresh seed.
 */
const PLACEMENT_SCHEMA = 'placement-v5';

type StoredPlacement = Placement & { schema: typeof PLACEMENT_SCHEMA };

const isStoredPlacement = (raw: unknown): raw is StoredPlacement => {
  if (!raw || typeof raw !== 'object') return false;
  const candidate = raw as Partial<StoredPlacement>;
  return candidate.schema === PLACEMENT_SCHEMA
    && typeof candidate.locations === 'object' && candidate.locations !== null
    && typeof candidate.stats === 'object' && candidate.stats !== null
    && Array.isArray(candidate.spheres);
};

const isLegacyPlacement = (raw: unknown): raw is LegacyPlacement => {
  if (!raw || typeof raw !== 'object') return false;
  const candidate = raw as Partial<LegacyPlacement>;
  return candidate.version === 1 && typeof candidate.assignments === 'object' && candidate.assignments !== null;
};

const loadRandomizerPlacement = async (profileId: string): Promise<Placement | null> => {
  const raw = await loadRandomizerState(profileId);
  if (isStoredPlacement(raw)) {
    const { schema: _schema, ...placement } = raw;
    return placement;
  }
  if (isLegacyPlacement(raw)) return adaptLegacyPlacement(raw);
  return null;
};

const saveRandomizerPlacement = async (profileId: string, placement: Placement): Promise<void> => {
  const stored: StoredPlacement = { schema: PLACEMENT_SCHEMA, ...placement };
  await saveRandomizerState(profileId, stored);
};

export { PLACEMENT_SCHEMA, loadRandomizerPlacement, saveRandomizerPlacement };
