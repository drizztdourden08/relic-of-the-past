/* @layer shared-game @kind logic */
/**
 * The minimal draft `ScreenRecord` a `create` recommendation proposes for a
 * room/overworld index the dataset has never catalogued — everything a
 * proposal needs BESIDES the identity (`gameId`/`kind`) and the display
 * label, which differ by caller and so stay theirs to supply.
 *
 * Extracted out of `presence.set.ts`'s own `toProposed` (Fix F3, the current
 * screen) so the connection strategy's `onUnresolvable` mapper (Fix F2/F4,
 * an arbitrary CROSSING destination) can propose a screen the same way — the
 * two callers disagree on how much identity they can supply (the current
 * screen's live register carries an `entranceId`/`palaceIndex` a crossing's
 * destination can never have), but they must still agree on what the REST of
 * a minimal draft record looks like.
 */
import type { AreaId, LocationId, ScreenGameId, ScreenRecord } from '../../../data/types';

/**
 * No dataset "unknown area/location" sentinel exists (searched: neither a
 * real `AreaRecord`/`LocationRecord` nor a documented placeholder id for
 * "genuinely unclassified" turned up anywhere in `shared/game/data`). What
 * DOES exist is `facade.ts`'s `missingRecord` fallback, which fills a broken
 * reference with `'area-000'`/`'location-000'` — ids no real record holds, so
 * `getArea`/`getLocation` resolve them to the same `(unregistered)` stand-in
 * this draft's own `randomizerName` placeholder already renders as. Reusing
 * it here means an unresolved `areaId`/`locationId` reads exactly as
 * obviously-wrong as the name does, rather than inventing a second sentinel
 * this phase was not asked to add. Flagged in the module report either way —
 * a real "unknown area" concept, if one gets added later, should replace this.
 */
const UNKNOWN_AREA_ID: AreaId = 'area-000';
const UNKNOWN_LOCATION_ID: LocationId = 'location-000';

/**
 * `kind`/`world` and the `label` used in `randomizerName` are the caller's own
 * call — see the header above — everything else about a freshly-minted,
 * not-yet-reviewed screen record is identical regardless of who is proposing it.
 */
const buildScreenDraftRecord = (
  gameId: ScreenGameId,
  kind: ScreenRecord['kind'],
  world: ScreenRecord['world'],
  label: string,
): Omit<ScreenRecord, 'id'> => ({
  gameId,
  kind,
  world,
  randomizerName: `Unnamed screen ${label}`,
  // No native answer for either field — see this file's own comment above.
  areaId: UNKNOWN_AREA_ID,
  locationId: UNKNOWN_LOCATION_ID,
  tags: [],
});

export { buildScreenDraftRecord };
