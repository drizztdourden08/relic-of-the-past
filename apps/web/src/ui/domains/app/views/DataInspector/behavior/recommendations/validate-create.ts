/* @layer renderer-app @kind logic */
/**
 * Whether a `create` proposal can actually land, checked BEFORE the write.
 *
 * A draft record is minted from live registers alone, so it can be missing
 * things only a person knows. Two independent reasons to refuse:
 *
 *  - It has no home on disk. `screenRecordFile` already owns that question for
 *    every screen shape (an interior needs its `interiorKind`, a dungeon room
 *    needs a dungeon record covering its palace index), so its `unresolved`
 *    reason is translated here rather than one arm of it being restated.
 *  - Its geography is a placeholder. The file target tolerates a placeless
 *    screen by design — one real record is filed that way — but an auto-accepted
 *    create must never introduce another one unreviewed.
 */
import { PLACEHOLDER_AREA_ID, PLACEHOLDER_LOCATION_ID } from '@shared/game/data';
import { screenRecordFile } from '@shared/game/data/record-file-targets';
import type { EntityKind } from '@shared/game/data';
import type { ScreenHome } from '@shared/game/data/record-file-targets';
import type { InspectorRow } from '../../DataInspector.type';

const NEEDS_AREA = 'a real area';
const NEEDS_LOCATION = 'a real location';

const screenBlockers = (proposed: InspectorRow): string[] => {
  const blockers: string[] = [];
  const target = screenRecordFile(proposed as unknown as ScreenHome);
  if (!target.relativePath) blockers.push(target.unresolved ?? 'a source file it can live in');
  if (!proposed.areaId || proposed.areaId === PLACEHOLDER_AREA_ID) blockers.push(NEEDS_AREA);
  if (!proposed.locationId || proposed.locationId === PLACEHOLDER_LOCATION_ID) blockers.push(NEEDS_LOCATION);
  return blockers;
};

/** What the proposal is still missing, in words a reviewer can act on. Empty
 *  means it is writable as it stands. */
const createBlockers = (kind: EntityKind, proposed: InspectorRow): readonly string[] =>
  (kind === 'screen' ? screenBlockers(proposed) : []);

export { createBlockers };
