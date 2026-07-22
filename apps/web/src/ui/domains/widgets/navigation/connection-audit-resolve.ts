/* @layer renderer-widgets @kind logic */
/**
 * Resolution helpers for the connection audit: real-transition index → screen
 * id, connection target-file selection, and tag inference for added edges.
 */

import { getScreenLookup, SCREEN_BY_ID } from '@shared/game/data/screens';
import { getDungeonName } from '@shared/game/data/screens/game-values';
import { DUNGEON_FILE_MAP } from '@shared/game/data/screen-codegen';
import type { ScreenDefinition } from '@shared/game/types';
import type { ConnectionTag } from '@shared/game/data/connections/tags';
import type { DetectedConnection } from './useDatasetStatus';
import type { RealDestKind } from './connection-audit-types';

// interior.kind → connections file stem (mirrors screen-codegen's fileMap).
const INTERIOR_FILE_MAP: Record<string, string> = {
  cave: 'caves', house: 'houses', shop: 'shops', fairy: 'fairy',
  well: 'wells', hint: 'hints', gamble: 'gamble', passage: 'passages',
  special: 'special',
};

const dungeonSlug = (screen: ScreenDefinition): string => {
  if (screen.type !== 'dungeon') return 'hyrule-castle';
  const name = getDungeonName(screen.dungeon.palaceIndex);
  return DUNGEON_FILE_MAP[name] ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

// Resolve a raw game index into its screen id, or null when unmapped.
const resolveRealDestId = (kind: RealDestKind, index: number): string | null => {
  const lookup = getScreenLookup();
  if (kind === 'screen') return lookup.byOverworldScreen.get(index)?.id ?? null;
  if (kind === 'entrance') return lookup.byEntranceId.get(index)?.id ?? null;
  // room: cave/house first, then scan dungeon rooms by suffix.
  const cave = lookup.byCaveRoom.get(index);
  if (cave) return cave.id;
  for (const [key, screen] of lookup.byDungeonRoom) {
    if (key.endsWith(`:${index}`)) return screen.id;
  }
  return null;
};

// Resolve a screen id to its native game index, split by which real-transition
// set it should be checked against: overworld screens carry an OW screen
// index, interior/dungeon screens carry a room index. Screens with no
// roomIndex (or unknown ids) resolve to neither, signalling "unresolvable".
const screenDestIndex = (screenId: string): { room?: number; screen?: number } => {
  const screen = SCREEN_BY_ID.get(screenId);
  if (!screen || screen.roomIndex == null) return {};
  return screen.type === 'overworld' ? { screen: screen.roomIndex } : { room: screen.roomIndex };
};

// Choose the connections source file (relative to shared/game/data/) for an edge.
const resolveConnectionTargetFile = (from: string, to: string): string => {
  const a = SCREEN_BY_ID.get(from);
  const b = SCREEN_BY_ID.get(to);
  const dungeon = [a, b].find(s => s?.type === 'dungeon');
  const interior = [a, b].find(s => s?.type === 'interior');
  const anchor = dungeon ?? interior ?? a ?? b;
  const world = anchor?.world === 'dark' ? 'dark-world' : 'light-world';

  if (dungeon) return `connections/${world}/dungeons/${dungeonSlug(dungeon)}.ts`;
  if (interior && interior.type === 'interior') {
    const stem = INTERIOR_FILE_MAP[interior.interior.kind] ?? 'caves';
    return `connections/${world}/${stem}.ts`;
  }
  // Both overworld — area adjacency lives under overworld/.
  return `connections/${world}/overworld/screen-adjacency.ts`;
};

// Infer connection tags for a detected-but-missing transition.
const inferTagsForDetected = (det: DetectedConnection): ConnectionTag[] => {
  if (det.type === 'entrance') return ['transit:door', 'dir:two-way', 'ctx:entrance'];
  if (det.type === 'stair') return ['transit:stairs', 'dir:two-way', 'ctx:internal'];
  if (det.type === 'hole') return ['transit:hole', 'dir:one-way', 'ctx:entrance'];
  return ['transit:walk', 'dir:two-way', 'ctx:overworld'];
};

export { resolveRealDestId, resolveConnectionTargetFile, inferTagsForDetected, screenDestIndex };
