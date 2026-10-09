/* @layer renderer-widgets @kind logic */
import { tagIdsForKeys } from '@shared/game/data';
import { screenBlockers } from '@shared/game/logic/queries/screen-validity';
import type { ScreenGameId, ScreenPosition } from '@shared/game/data';
import type { DraftResult, ScreenDraft } from './screen-editor.type';

const gameIdFor = (draft: ScreenDraft): ScreenGameId => {
  if (draft.kind === 'overworld') return { overworldIndex: draft.overworldIndex };
  if (draft.kind === 'dungeon') return { roomIndex: draft.roomIndex, palaceIndex: draft.palaceIndex };
  return { roomIndex: draft.roomIndex, entranceId: draft.entranceId };
};

const positionFor = (draft: ScreenDraft, blockers: string[]): ScreenPosition | undefined => {
  const { gridX, gridY, floor } = draft;
  if (gridX === undefined || gridY === undefined) {
    if (floor !== undefined) blockers.push('a grid X and Y for its floor to sit on');
    return undefined;
  }
  return floor === undefined ? { gridX, gridY } : { gridX, gridY, floor };
};

const buildScreenRecord = (draft: ScreenDraft): DraftResult => {
  const { areaId, locationId } = draft;
  const gameId = gameIdFor(draft);
  const blockers: string[] = [];
  if (!draft.name.trim()) blockers.push('a name');
  const position = positionFor(draft, blockers);
  blockers.push(...screenBlockers({
    id: draft.existing?.id,
    kind: draft.kind,
    world: draft.world,
    interiorKind: draft.kind === 'interior' ? draft.interiorKind : undefined,
    areaId,
    locationId,
    gameId,
    position,
    variant: draft.variant,
  }));
  if (blockers.length > 0 || !areaId || !locationId) return { record: null, blockers };

  return {
    record: {
      gameId,
      kind: draft.kind,
      world: draft.world,
      interiorKind: draft.kind === 'interior' ? draft.interiorKind : undefined,
      name: draft.name.trim(),
      areaId,
      locationId,
      position,
      tags: tagIdsForKeys(draft.tags),
      variant: draft.variant,
      nav: draft.existing?.nav,
      triggerIds: draft.existing?.triggerIds,
      spawns: draft.existing?.spawns,
      review: draft.existing?.review,
    },
    blockers,
  };
};

export { buildScreenRecord };
export type { DraftResult, ScreenDraft } from './screen-editor.type';
