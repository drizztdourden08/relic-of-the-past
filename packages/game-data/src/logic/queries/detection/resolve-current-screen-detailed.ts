/* @layer shared-game @kind logic */
import type { ScreenRecord } from '../../../data';
import { scanForRoom } from '../palace-fallback';
import { LAST_DUNGEON_INDEX } from './detection.constants';
import type {
  IndoorQuery, ScreenLookup, ScreenMatchMethod, ScreenMatchResult, ScreenQuery, VariantGameState,
} from './detection.type';
import { getScreenLookup } from './get-screen-lookup';
import { resolveVariant } from './resolve-variant';

const entranceMatch = (lookup: ScreenLookup, roomIndex: number, whichEntrance?: number): ScreenMatchResult | null => {
  if (whichEntrance == null || whichEntrance === 0) return null;
  const byEntrance = (lookup.byEntranceId.get(whichEntrance) ?? [])
    .filter((candidate) => candidate.gameId.roomIndex === roomIndex);
  const [only] = byEntrance;
  return byEntrance.length === 1 && only !== undefined ? { screen: only, method: 'entrance' } : null;
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

const caveMethod = (candidateCount: number, resolved: ScreenRecord): ScreenMatchMethod => {
  if (candidateCount === 1) return 'cave-single';
  return resolved.variant ? 'variant' : 'cave-ambiguous';
};

const caveMatch = (lookup: ScreenLookup, roomIndex: number, variantState?: VariantGameState): ScreenMatchResult | null => {
  const candidates = lookup.byCaveRoomAll.get(roomIndex);
  const first = candidates?.[0];
  if (!candidates || first === undefined) return null;
  if (candidates.length === 1 && !first.variant) {
    return { screen: first, method: 'cave-single', progressTier: variantState?.progressTier };
  }
  const resolved = resolveVariant(candidates, variantState);
  return { screen: resolved, method: caveMethod(candidates.length, resolved), progressTier: variantState?.progressTier };
};

const indoorMatch = (lookup: ScreenLookup, query: IndoorQuery): ScreenMatchResult | null => {
  const { palaceIndex, roomIndex, whichEntrance, variantState } = query;
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

const resolveCurrentScreenDetailed = (query: ScreenQuery): ScreenMatchResult | null => {
  const lookup = getScreenLookup();
  if (query.isIndoors) return indoorMatch(lookup, query);
  const ow = lookup.byOverworldScreen.get(query.overworldScreenIndex);
  return ow ? { screen: ow, method: 'overworld' } : null;
};

export { resolveCurrentScreenDetailed };
