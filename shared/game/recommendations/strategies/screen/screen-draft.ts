/* @layer shared-game @kind logic */
/**
 * The minimal draft `ScreenRecord` a `create` recommendation proposes for a
 * room/overworld index the dataset has never catalogued — everything a
 * proposal needs BESIDES the identity (`gameId`/`kind`) and the display
 * label, which differ by caller and so stay theirs to supply.
 *
 * Two callers share it: `presence.set.ts` (the screen the player is standing
 * on) and the connection strategy's `onUnresolvable` mapper (an arbitrary
 * crossing destination). They disagree on how much identity they can supply —
 * the current screen's live registers carry a palace index a crossing's
 * destination never can — but the REST of a minimal draft is the same either
 * way.
 *
 * Nothing here is enough to write. Geography has no native answer at all, so
 * the draft carries the dataset's own placeholder ids and an obviously
 * unfinished name; `validate-create.ts` is what refuses to let that reach disk.
 */
import { PLACEHOLDER_AREA_ID, PLACEHOLDER_LOCATION_ID } from '../../../data/facade';
import type { ScreenGameId, ScreenRecord } from '../../../data/types';

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
  areaId: PLACEHOLDER_AREA_ID,
  locationId: PLACEHOLDER_LOCATION_ID,
  tags: [],
});

export { buildScreenDraftRecord };
