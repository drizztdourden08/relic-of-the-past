/* @layer renderer-widgets @kind logic */
/**
 * Resolution helper for the connection audit: a real-transition index → the
 * screen id it names. `screenDestIndex`/`inferTagsForDetected` used to live
 * here too, backing `connection-audit-core.ts`'s hand-rolled add/remove pair;
 * both were removed in phase 4, part 2 once the connection `SetProbe`s
 * (`recommendations/strategies/connection/points.set.ts`, `indoor-edge.set.ts`)
 * replaced that mechanism. See those files for the tag inference and
 * `screen-endpoint.ts` for the direction-aware key this one used to need
 * `screenDestIndex` for.
 */

import { getScreenLookup } from '@shared/game/logic/queries/detection';
import { findOne, getScreenByGameId } from '@shared/game/data';
import type { ScreenId } from '@shared/game/data';
import type { RealDestKind } from './connection-audit-types';

// Resolve a raw game index into its screen id, or null when unmapped.
const resolveRealDestId = (kind: RealDestKind, index: number): ScreenId | null => {
  const lookup = getScreenLookup();
  if (kind === 'screen') return lookup.byOverworldScreen.get(index)?.id ?? null;
  if (kind === 'entrance') return lookup.byEntranceId.get(index)?.id ?? null;
  const indoor = getScreenByGameId({ roomIndex: index })
    ?? lookup.byCaveRoom.get(index)
    ?? findOne('screen', s => s.kind === 'dungeon' && s.gameId.roomIndex === index);
  return indoor?.id ?? null;
};

export { resolveRealDestId };
