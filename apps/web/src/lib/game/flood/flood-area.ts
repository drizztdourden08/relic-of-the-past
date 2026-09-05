/* @layer bridge-wasm @kind logic */
/**
 * THE flood, for every caller (widget and simulator), so the widget can be trusted to report
 * what the simulator sees. `floodOneScreen` is the single-screen unit; `propagateArea` chains
 * it across a big screen's sub-screens. The ONLY thing a caller varies is where the walk
 * starts. Same grids, same options, same numbers for the same seeds.
 */
import type { ConnectionInfo, FloodFillResult, GridPos, OverworldEntrance } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { SimLocation } from '@shared/game/simulation';
import { floodFillScreen, getConnections } from '@shared/game/navigation';
import { computeBigScreenGroup } from '@domains/widgets/navigation/widget-helpers';
import { buildFloodOptions } from './flood-options';
import { getScreenGrids } from './screen-grids';
import { roomEntrances, STAIR_ID_BASE } from './room-entrances';
import { createSeedLedger } from './area-seeds';
import { crossingLanding, roomLandingTile } from './area-landings';
import type { EdgeName } from './area-landings';

interface ScreenFloodRequest {
  items: TileReq[];
  /** Where the walk starts; omitted lets the BFS pick. */
  startPos?: GridPos;
  /** Further BFS seeds. These are crossings propagating in from an adjacent screen. */
  extraSeeds?: GridPos[];
  /** True when startPos is the player's real position in the loaded screen. */
  atPlayer?: boolean;
  /** Entrances to report against. `findEntrancePositions` filters this to the
   *  screen itself, so passing the whole enriched list is the same as passing
   *  one screen's worth. Neither seeds the BFS. */
  entrances: OverworldEntrance[];
  /** Intra-room scroll boundaries of a 2x2 room (indoor only). */
  intraEdges?: EdgeName[];
}

interface ScreenFloodResult {
  screenIndex: number;
  result: FloodFillResult;
  connections: ConnectionInfo[];
}

/** Flood one screen or room. Null when its grid cannot be built. */
const floodOneScreen = (location: SimLocation, req: ScreenFloodRequest): ScreenFloodResult | null => {
  const { items, startPos, extraSeeds, atPlayer, entrances, intraEdges } = req;
  const bundle = getScreenGrids(location);
  if (!bundle.rawAttrGrid.length) return null;
  const options = buildFloodOptions({ location, items, startPos, extraSeeds, atPlayer, entrances }, bundle);
  const result = floodFillScreen(bundle.rawAttrGrid, bundle.screenIndex, options);
  return {
    screenIndex: bundle.screenIndex,
    result,
    connections: getConnections(result, intraEdges && intraEdges.length > 0 ? intraEdges : undefined),
  };
};

interface AreaFloodRequest extends ScreenFloodRequest {
  isIndoors: boolean;
  /** The screen or room the walk starts in. */
  primaryScreenIndex: number;
}

/** A screen is re-flooded only when it gains a seed its last run could not
 *  already reach, so passes converge quickly; this is a runaway guard rather
 *  than a real limit on how far seeds travel. */
const MAX_ITERATIONS = 12;

/** Bound on rooms discovered indoors: a dungeon's room graph runs far deeper than the
 *  local area a flood describes. Same order as a big-screen group (1-4 screens), still
 *  covering a short chain like the first castle's entrance hall. */
const MAX_INDOOR_ROOMS = 8;

/**
 * Flood a whole big screen: the primary sub-screen from the player's position, then each
 * neighbour its crossings reach, seeded with the landing tiles. Indoors it grows through
 * stairs and walk-through boundaries (capped by MAX_INDOOR_ROOMS); each room's grid is
 * rebuilt addressably by getScreenGrids, never through the destructive Dungeon_LoadRoom.
 */
const propagateArea = (req: AreaFloodRequest): ScreenFloodResult[] => {
  const { isIndoors, primaryScreenIndex, startPos, ...shared } = req;
  const allowed = new Set(isIndoors ? [primaryScreenIndex] : computeBigScreenGroup(primaryScreenIndex));
  const locationOf = (screenIndex: number): SimLocation => isIndoors
    ? { isIndoors: true, roomId: screenIndex, owScreenIndex: 0 }
    : { isIndoors: false, roomId: 0, owScreenIndex: screenIndex };

  // Indoors the caller only computed the primary room's entrances; a newly discovered room
  // needs its OWN list or propagation could only reach one room deep.
  const entranceCache = new Map<number, OverworldEntrance[]>();
  const entrancesFor = (screenIndex: number): OverworldEntrance[] => {
    if (!isIndoors || screenIndex === primaryScreenIndex) return shared.entrances;
    const cached = entranceCache.get(screenIndex);
    if (cached) return cached;
    const fresh = roomEntrances(screenIndex);
    entranceCache.set(screenIndex, fresh);
    return fresh;
  };

  const analyzed = new Map<number, ScreenFloodResult>();
  const ledger = createSeedLedger();
  let dirty = new Set<number>([primaryScreenIndex]);

  /**
   * Offer a crossing's landing tile to the screen it lands on. Queues a (re)flood only when
   * the tile is new AND the last flood could not already walk there, so the passes converge
   * instead of ping-ponging. Reads `dirty` at call time (the set for the NEXT pass).
   */
  const offerSeed = (screenIndex: number, tile: GridPos): void => {
    if (!allowed.has(screenIndex)) return;
    if (!ledger.add(screenIndex, tile)) return;
    const prev = analyzed.get(screenIndex);
    if (prev && (prev.result.reachable[tile.row]?.[tile.col] ?? 0) > 0) return;
    dirty.add(screenIndex);
  };

  for (let pass = 0; pass < MAX_ITERATIONS && dirty.size > 0; pass++) {
    const batch = [...dirty];
    dirty = new Set();
    for (const screenIndex of batch) {
      const isPrimary = screenIndex === primaryScreenIndex;
      // The primary starts at the player's position; every other screen starts on the first
      // crossing that reached it. The REST of the accumulated seeds ride along either way.
      const known = ledger.list(screenIndex);
      const start = isPrimary && startPos ? startPos : known[0];
      const extra = isPrimary && startPos ? known : known.slice(1);
      const entry = floodOneScreen(locationOf(screenIndex), {
        ...shared,
        entrances: entrancesFor(screenIndex),
        ...(start ? { startPos: start } : {}),
        ...(extra.length > 0 ? { extraSeeds: extra } : {}),
        // Only the screen the player really stands in can claim the live position.
        atPlayer: isPrimary ? shared.atPlayer : false,
      });
      if (!entry) continue;
      analyzed.set(screenIndex, entry);
      for (const t of entry.result.transitions) {
        if (t.edge === 'entrance') {
          // Room-stair/walk-boundary ids (>= STAIR_ID_BASE) name a room to grow into; anything
          // below leaves the indoor graph and is reported as an exit, not propagated.
          if (!isIndoors || t.entranceIdx == null || t.entranceIdx < STAIR_ID_BASE) continue;
          const destRoom = entrancesFor(screenIndex).find((e) => e.id === t.entranceIdx)?.roomId;
          if (!destRoom || destRoom === screenIndex) continue;
          if (!allowed.has(destRoom) && allowed.size < MAX_INDOOR_ROOMS) allowed.add(destRoom);
          const landing = roomLandingTile(destRoom, screenIndex);
          if (landing) offerSeed(destRoom, landing);
          continue;
        }
        const landing = crossingLanding(screenIndex, t.edge, t);
        if (landing) offerSeed(landing.screenIndex, landing.tile);
      }
    }
  }
  return [...analyzed.values()];
};

export { floodOneScreen, propagateArea };
export type { ScreenFloodRequest, ScreenFloodResult, AreaFloodRequest };
