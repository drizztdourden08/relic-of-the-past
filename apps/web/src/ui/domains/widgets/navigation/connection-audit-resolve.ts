/* @layer renderer-widgets @kind logic */
/**
 * Resolution helpers for the connection audit: a real-transition index → the
 * screen id it names, and tag inference for a detected-but-missing edge.
 *
 * Destination FILES are not chosen here — `connectionRecordFile` derives those
 * from the endpoints' own ids, so no display name and no slug is involved.
 */

import { getScreenLookup } from '@shared/game/logic/queries/detection';
import { gameScreenIdOf } from '@shared/game/logic/queries/game-id';
import { findOne, getScreen, getScreenByGameId } from '@shared/game/data';
import type { ScreenId, ConnectionTag } from '@shared/game/data';
import type { DetectedConnection } from './useDatasetStatus';
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

// Resolve a screen id to its native game index, split by which real-transition
// set it should be checked against: overworld screens carry an OW screen
// index, interior/dungeon screens carry a room index. Screens with no
// native index (or unknown ids) resolve to neither, signalling "unresolvable".
const screenDestIndex = (screenId: ScreenId): { room?: number; screen?: number } => {
  const screen = getScreen(screenId);
  const gameId = gameScreenIdOf(screen);
  if (!gameId) return {};
  return gameId.kind === 'overworld' ? { screen: gameId.screen } : { room: gameId.room };
};

// Infer connection tags for a detected-but-missing transition.
const inferTagsForDetected = (det: DetectedConnection): ConnectionTag[] => {
  if (det.type === 'entrance') return ['transit:door', 'dir:two-way', det.isExit ? 'ctx:exit' : 'ctx:entrance'];
  if (det.type === 'stair') return ['transit:stairs', 'dir:two-way', 'ctx:internal'];
  if (det.type === 'hole') return ['transit:hole', 'dir:one-way', 'ctx:entrance'];
  return ['transit:walk', 'dir:two-way', 'ctx:overworld'];
};

export { resolveRealDestId, inferTagsForDetected, screenDestIndex };
