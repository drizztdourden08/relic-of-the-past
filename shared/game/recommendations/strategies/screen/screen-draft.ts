/* @layer shared-game @kind logic */
/**
 * The minimal draft `ScreenRecord` a `create` recommendation proposes for an
 * uncatalogued room/overworld index: everything BESIDES the identity
 * (`gameId`/`kind`) and the label, which differ by caller. Shared by
 * `presence.set.ts` (the current screen) and the connection strategy's
 * `onUnresolvable` mapper (a crossing destination).
 */
import type { AreaId, LocationId, ScreenGameId, ScreenRecord } from '../../../data/types';

/**
 * No dataset "unknown area/location" sentinel exists. `facade.ts`'s
 * `missingRecord` fallback fills a broken reference with `'area-000'`/
 * `'location-000'`, ids no real record holds, which `getArea`/`getLocation`
 * render as `(unregistered)`. Reused here so an unresolved id reads as
 * obviously wrong as the name placeholder does. A real "unknown area" concept
 * should replace this if one is added.
 */
const UNKNOWN_AREA_ID: AreaId = 'area-000';
const UNKNOWN_LOCATION_ID: LocationId = 'location-000';

/** `kind`/`world` and the `label` are the caller's; everything else about a
 *  fresh, unreviewed screen record is identical regardless of who proposes it. */
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
  // No native answer for either field (see above).
  areaId: UNKNOWN_AREA_ID,
  locationId: UNKNOWN_LOCATION_ID,
  tags: [],
});

export { buildScreenDraftRecord };
