/* @layer shared-game @kind logic */
import { PLACEHOLDER_AREA_ID, PLACEHOLDER_LOCATION_ID } from '@rotp/game-data';
import type { ScreenGameId, ScreenRecord } from '@rotp/game-data';

const buildScreenDraftRecord = (
  gameId: ScreenGameId,
  kind: ScreenRecord['kind'],
  world: ScreenRecord['world'],
  label: string,
): Omit<ScreenRecord, 'id'> => ({
  gameId,
  kind,
  world,
  name: `Unnamed screen ${label}`,
  areaId: PLACEHOLDER_AREA_ID,
  locationId: PLACEHOLDER_LOCATION_ID,
  tags: [],
});

export { buildScreenDraftRecord };
