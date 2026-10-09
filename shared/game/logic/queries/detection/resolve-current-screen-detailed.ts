/* @layer shared-game @kind logic */
import { scanForRoom } from '../palace-fallback';
import { LAST_DUNGEON_INDEX } from './detection.constants';
import type { ScreenLookup, ScreenMatchResult, VariantGameState } from './detection.type';
import { getScreenLookup } from './get-screen-lookup';
import { resolveVariant } from './resolve-variant';

const entranceMatch = (lookup: ScreenLookup, roomIndex: number, whichEntrance?: number): ScreenMatchResult | null => {
  if (whichEntrance == null || whichEntrance === 0) return null;
  const byEntrance = (lookup.byEntranceId.get(whichEntrance) ?? [])
    .filter((candidate) => candidate.gameId.roomIndex === roomIndex);
  return byEntrance.length === 1 ? { screen: byEntrance[0], method: 'entrance' } : null;
};

const palaceScanMatch = (lookup: ScreenLookup, roomIndex: number, palaceIndex: number): ScreenMatchResult | null => {
  const scanned = scanForRoom(lookup.byDungeonRoom, roomIndex, palaceIndex);
  if (!scanned) return null;
  return {
    screen: scanned.screen,
    method: 'palace-scan',
    palaceMismatch: { expected: scanned.expected, actual: palaceIndex },
  };
};

const caveMatch = (lookup: ScreenLookup, roomIndex: number, variantState?: VariantGameState): ScreenMatchResult | null => {
  const candidates = lookup.byCaveRoomAll.get(roomIndex);
  if (candidates && candidates.length === 1 && !candidates[0].variant) {
    return { screen: candidates[0], method: 'cave-single', progressTier: variantState?.progressTier };
  }
  if (candidates && candidates.length >= 1) {
    const resolved = resolveVariant(candidates, variantState);
    const method = candidates.length === 1 ? 'cave-single'
      : (resolved.variant ? 'variant' : 'cave-ambiguous');
    return { screen: resolved, method, progressTier: variantState?.progressTier };
  }
  return null;
};

const indoorMatch = (lookup: ScreenLookup, palaceIndex: number, roomIndex: number, whichEntrance?: number, variantState?: VariantGameState): ScreenMatchResult | null => {
  const byEntrance = entranceMatch(lookup, roomIndex, whichEntrance);
  if (byEntrance) return byEntrance;

  const isKnownDungeon = palaceIndex >> 1 <= LAST_DUNGEON_INDEX;
  if (isKnownDungeon) {
    const dungeon = lookup.byDungeonRoom.get(`${palaceIndex}:${roomIndex}`);
    if (dungeon) return { screen: dungeon, method: 'exact' };
    const scanned = palaceScanMatch(lookup, roomIndex, palaceIndex);
    if (scanned) return scanned;
  }

  const cave = caveMatch(lookup, roomIndex, variantState);
  if (cave) return cave;

  return isKnownDungeon ? null : palaceScanMatch(lookup, roomIndex, palaceIndex);
};

const resolveCurrentScreenDetailed = (isIndoors: boolean, palaceIndex: number, roomIndex: number, overworldScreenIndex: number, whichEntrance?: number, variantState?: VariantGameState): ScreenMatchResult | null => {
  const lookup = getScreenLookup();
  if (isIndoors) return indoorMatch(lookup, palaceIndex, roomIndex, whichEntrance, variantState);
  const ow = lookup.byOverworldScreen.get(overworldScreenIndex);
  return ow ? { screen: ow, method: 'overworld' } : null;
};

export { resolveCurrentScreenDetailed };
