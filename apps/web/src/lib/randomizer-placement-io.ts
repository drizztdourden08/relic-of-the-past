/* @layer renderer-lib @kind logic */
/**
 * Typed wrapper around the per-profile randomizer-placement store
 * (profiles/<id>/randomizer.json). Writes the v2 shape, the ApPlacement
 * under an explicit schema stamp, and reads BOTH generations back as an
 * ApPlacement: a v2 file loads directly, a legacy v1 Placement (dataset
 * check/item ids) is lifted through the adapter so old profiles keep
 * playing. Callers get an ApPlacement or null, never a half-parsed blob.
 */
import { REFERENCE_CAPACITY_SPOT_NAMES } from '@shared/randomizer/ap-world/capacity/capacity-spots.data';
import { REFERENCE_POND_SLOT_NAMES } from '@shared/randomizer/ap-world/pond/pond-locations.data';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { Placement } from '@shared/randomizer/placement.type';
import { adaptLegacyPlacement } from './game/randomizer-client/legacy-placement';
import { loadRandomizerState, saveRandomizerState } from './storage/profile-data-store';

const AP_PLACEMENT_SCHEMA = 'ap-placement-v1';

type StoredApPlacement = ApPlacement & { schema: typeof AP_PLACEMENT_SCHEMA };

const isStoredApPlacement = (raw: unknown): raw is StoredApPlacement => {
  if (!raw || typeof raw !== 'object') return false;
  const candidate = raw as Partial<StoredApPlacement>;
  return candidate.schema === AP_PLACEMENT_SCHEMA
    && typeof candidate.nameView === 'object' && candidate.nameView !== null
    && typeof candidate.stats === 'object' && candidate.stats !== null
    && Array.isArray(candidate.spheres);
};

const isLegacyPlacement = (raw: unknown): raw is Placement => {
  if (!raw || typeof raw !== 'object') return false;
  const candidate = raw as Partial<Placement>;
  return candidate.version === 1 && typeof candidate.assignments === 'object' && candidate.assignments !== null;
};

/**
 * The pond's first two slots renamed away from the reference's "left" and "right", which
 * described a shop the game does not have. A placement frozen before that carries the old
 * pair, and which name each becomes depends on what the pond was: a legacy pond's two slots
 * are the capacity families' own fairy slots, any other mode's are the first two rungs of
 * the prize ladder. Applied to the location keys and to the sweep spheres, the two places a
 * location name is stored.
 */
const renameReferenceSlots = (placement: ApPlacement): ApPlacement => {
  const legacyPond = placement.stats?.pond === undefined || placement.stats.pond.mode === 'capacity';
  const renamed = legacyPond ? REFERENCE_CAPACITY_SPOT_NAMES : REFERENCE_POND_SLOT_NAMES;
  const nameOf = (location: string): string => renamed.get(location) ?? location;
  if (!Object.keys(placement.nameView).some((location) => renamed.has(location))) return placement;
  return {
    ...placement,
    nameView: Object.fromEntries(
      Object.entries(placement.nameView).map(([location, item]) => [nameOf(location), item]),
    ),
    spheres: placement.spheres.map((sphere) => ({ ...sphere, locations: sphere.locations.map(nameOf) })),
  };
};

const loadRandomizerPlacement = async (profileId: string): Promise<ApPlacement | null> => {
  const raw = await loadRandomizerState(profileId);
  if (isStoredApPlacement(raw)) {
    const { schema: _schema, ...placement } = raw;
    return renameReferenceSlots(placement);
  }
  if (isLegacyPlacement(raw)) return adaptLegacyPlacement(raw);
  return null;
};

const saveRandomizerPlacement = async (profileId: string, placement: ApPlacement): Promise<void> => {
  const stored: StoredApPlacement = { schema: AP_PLACEMENT_SCHEMA, ...placement };
  await saveRandomizerState(profileId, stored);
};

export { AP_PLACEMENT_SCHEMA, loadRandomizerPlacement, saveRandomizerPlacement };
