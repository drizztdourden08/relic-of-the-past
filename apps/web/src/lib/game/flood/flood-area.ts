/* @layer bridge-wasm @kind logic */
/**
 * THE flood. One screen, and one area of screens, for every caller.
 *
 * The nav widget and the simulator used to run the same core BFS through two
 * different setups: the widget assembled FloodFillOptions by hand and read its
 * solid-sprite blockers from the LIVE sprite list, while the simulator went
 * through buildFloodOptions and the addressable spawn table. Live reads only
 * describe the screen the game is standing on, so the two disagreed about which
 * tiles were blocked the moment you looked at anywhere else — and a widget that
 * cannot be trusted to report what the simulator sees is a widget you cannot
 * troubleshoot the simulator with.
 *
 * So both now come through here. `floodOneScreen` is the single-screen unit and
 * `propagateArea` chains it across a big screen's sub-screens. The ONLY thing a
 * caller varies is where the walk starts: the widget pools every seed an area's
 * crossings hand it and floods each screen once, while the simulator floods per
 * arrival from the one tile it actually arrived on. Same grids, same options,
 * same numbers for the same seeds.
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
  /** Further BFS seeds — crossings propagating in from an adjacent screen. */
  extraSeeds?: GridPos[];
  /** True when startPos is the player's real position in the loaded screen. */
  atPlayer?: boolean;
  /** Entrances to report against. `findEntrancePositions` filters this to the
   *  screen itself, so passing the whole enriched list is the same as passing
   *  one screen's worth — neither seeds the BFS. */
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

/** Rooms discovered indoors are bounded — a dungeon's connected-room graph can
 *  run far deeper than the local area a flood is meant to describe. This is
 *  the same order of size as an overworld big-screen group (usually 1-4
 *  screens) while still covering a short indoor chain like the first castle's
 *  entrance hall (West/Main/East Entrance). */
const MAX_INDOOR_ROOMS = 8;

/**
 * Flood a whole big screen: the primary sub-screen from the player's position,
 * then each neighbour its crossings reach, seeded with every tile those
 * crossings land on.
 *
 * Indoors this starts from the primary room and grows through its stairs and
 * walk-through boundaries (capped by MAX_INDOOR_ROOMS): each connected room's
 * OWN grid is rebuilt addressably by getScreenGrids exactly like the simulator
 * already does for any room the player isn't standing in — never through the
 * destructive Dungeon_LoadRoom, which only the LIVE room ever goes through.
 */
const propagateArea = (req: AreaFloodRequest): ScreenFloodResult[] => {
  const { isIndoors, primaryScreenIndex, startPos, ...shared } = req;
  const allowed = new Set(isIndoors ? [primaryScreenIndex] : computeBigScreenGroup(primaryScreenIndex));
  const locationOf = (screenIndex: number): SimLocation => isIndoors
    ? { isIndoors: true, roomId: screenIndex, owScreenIndex: 0 }
    : { isIndoors: false, roomId: 0, owScreenIndex: screenIndex };

  // Indoors, only the primary room's entrances were computed by the caller (the
  // widget only ever calls roomEntrances() for the room the player occupies); a
  // newly discovered room needs its OWN list so its stairs/boundaries can be
  // found too, or propagation could only ever reach one room deep.
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
   * Offer a crossing's landing tile to the screen it lands on. Queues that
   * screen for a (re)flood only when the tile is genuinely new AND its last
   * flood could not already walk there — so a crossing into ground already
   * covered costs nothing, and the passes converge instead of ping-ponging.
   * Reads `dirty` at call time, which is the set for the NEXT pass.
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
      // The primary keeps the player's own position as its start; every other
      // screen starts on the first crossing that reached it. Either way the
      // REST of the accumulated seeds ride along, so a screen re-run after a
      // neighbour opened a second way in floods from both at once.
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
          // Room-stair/walk-boundary ids (>= STAIR_ID_BASE) name a destination
          // room to grow into; anything below that (a real overworld door, or a
          // fall-hole id) leaves the indoor room graph entirely and is reported
          // as an exit, not propagated.
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
