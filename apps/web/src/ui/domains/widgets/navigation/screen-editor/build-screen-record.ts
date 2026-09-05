/* @layer renderer-widgets @kind logic */
/**
 * Form state → a `ScreenRecord` minus its id.
 *
 * The return type is the record shape itself, so the editor cannot emit a stale
 * one: a field the migration added is either filled in here or fails to compile.
 * Fields the form does not edit (`vanillaName`, `nav`, `triggerIds`, `spawns`)
 * are carried across from the record being edited.
 *
 * Anything missing comes back as a blocker instead of a fabricated value: no
 * placeholder ids, no zeroed grid positions.
 */
import type { PendingScreenRecord } from '@shared/game/data/record-codegen';
import { tagIdsForKeys } from '@shared/game/data';
import type { ScreenGameId, ScreenPosition, ScreenRecord, ScreenTag } from '@shared/game/data';

interface ScreenDraft {
  kind: ScreenRecord['kind'];
  world: ScreenRecord['world'];
  interiorKind: ScreenRecord['interiorKind'];
  randomizerName: string;
  areaId: ScreenRecord['areaId'] | '';
  locationId: ScreenRecord['locationId'] | '';
  /** The form picks TERMS; `buildScreenRecord` resolves them to tag ids. */
  tags: readonly ScreenTag[];
  variant: ScreenRecord['variant'];
  /** Native indices, already numeric. */
  roomIndex: number;
  overworldIndex: number;
  palaceIndex: number | undefined;
  entranceId: number | undefined;
  gridX: number | undefined;
  gridY: number | undefined;
  floor: number | undefined;
  /** The record being edited, for the fields this form does not own. */
  existing: ScreenRecord | null;
}

interface DraftResult {
  record: PendingScreenRecord | null;
  blockers: string[];
}

const gameIdFor = (draft: ScreenDraft): ScreenGameId => {
  if (draft.kind === 'overworld') return { overworldIndex: draft.overworldIndex };
  if (draft.kind === 'dungeon') return { roomIndex: draft.roomIndex, palaceIndex: draft.palaceIndex };
  return { roomIndex: draft.roomIndex, entranceId: draft.entranceId };
};

const positionFor = (draft: ScreenDraft, blockers: string[]): ScreenPosition | undefined => {
  const { gridX, gridY, floor } = draft;
  if (gridX === undefined || gridY === undefined) {
    if (floor !== undefined) blockers.push('A floor needs a grid X and Y to sit on');
    return undefined;
  }
  return floor === undefined ? { gridX, gridY } : { gridX, gridY, floor };
};

const buildScreenRecord = (draft: ScreenDraft): DraftResult => {
  const blockers: string[] = [];
  if (!draft.randomizerName.trim()) blockers.push('A name is required');
  if (!draft.areaId) blockers.push('An area is required');
  if (!draft.locationId) blockers.push('A location is required');
  if (draft.kind === 'dungeon' && draft.palaceIndex === undefined) blockers.push('A palace index is required');
  const position = positionFor(draft, blockers);
  if (!draft.areaId || !draft.locationId) return { record: null, blockers };
  if (blockers.length > 0) return { record: null, blockers };

  return {
    record: {
      gameId: gameIdFor(draft),
      kind: draft.kind,
      world: draft.world,
      interiorKind: draft.kind === 'interior' ? draft.interiorKind : undefined,
      vanillaName: draft.existing?.vanillaName,
      randomizerName: draft.randomizerName.trim(),
      areaId: draft.areaId,
      locationId: draft.locationId,
      position,
      // The form works in terms; the record stores references to them.
      tags: tagIdsForKeys(draft.tags),
      variant: draft.variant,
      nav: draft.existing?.nav,
      triggerIds: draft.existing?.triggerIds,
      spawns: draft.existing?.spawns,
    },
    blockers,
  };
};

export { buildScreenRecord };
export type { DraftResult, ScreenDraft };
