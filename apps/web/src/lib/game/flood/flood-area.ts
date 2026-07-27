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

type EdgeName = 'north' | 'south' | 'east' | 'west';

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

/** A screen is only ever flooded once per area run, so a cap this size is a
 *  runaway guard rather than a real limit on how far seeds travel. */
const MAX_ITERATIONS = 8;

/**
 * Flood a whole big screen: the primary sub-screen from the player's position,
 * then each neighbour its crossings reach, seeded with every tile those
 * crossings land on.
 *
 * Indoors this is the primary room ALONE. Loading an adjacent room's grid goes
 * through Dungeon_LoadRoom, which is destructive — it would corrupt the live
 * game's collision state to answer a question about a room the player is not in.
 */
const propagateArea = (req: AreaFloodRequest): ScreenFloodResult[] => {
  const { isIndoors, primaryScreenIndex, startPos, ...shared } = req;
  const allowed = new Set(isIndoors ? [primaryScreenIndex] : computeBigScreenGroup(primaryScreenIndex));
  const locationOf = (screenIndex: number): SimLocation => isIndoors
    ? { isIndoors: true, roomId: screenIndex, owScreenIndex: 0 }
    : { isIndoors: false, roomId: 0, owScreenIndex: screenIndex };

  const analyzed = new Map<number, ScreenFloodResult>();
  let pending = new Map<number, GridPos[]>([[primaryScreenIndex, startPos ? [startPos] : []]]);

  for (let pass = 0; pass < MAX_ITERATIONS && pending.size > 0; pass++) {
    const batch = [...pending];
    pending = new Map();
    for (const [screenIndex, seeds] of batch) {
      const entry = floodOneScreen(locationOf(screenIndex), {
        ...shared,
        ...(seeds[0] ? { startPos: seeds[0] } : {}),
        ...(seeds.length > 1 ? { extraSeeds: seeds.slice(1) } : {}),
        // Only the screen the player really stands in can claim the live position.
        atPlayer: screenIndex === primaryScreenIndex ? shared.atPlayer : false,
      });
      if (!entry) continue;
      analyzed.set(screenIndex, entry);
      for (const t of entry.result.transitions) {
        if (t.edge === 'entrance') continue;
        const landing = crossingLanding(screenIndex, t.edge, t);
        if (!landing || !allowed.has(landing.screenIndex) || analyzed.has(landing.screenIndex)) continue;
        pending.set(landing.screenIndex, [...(pending.get(landing.screenIndex) ?? []), landing.tile]);
      }
    }
  }
  return [...analyzed.values()];
};

/** Where a border crossing puts the player: the adjacent screen, against its
 *  opposite wall at the same position along the edge. */
const crossingLanding = (screenIndex: number, edge: EdgeName, at: { row: number; col: number }): { screenIndex: number; tile: GridPos } | null => {
  const sRow = (screenIndex >> 3) & 7;
  const sCol = screenIndex & 7;
  switch (edge) {
    case 'north': return sRow > 0 ? { screenIndex: ((sRow - 1) << 3) | sCol, tile: { row: 63, col: at.col } } : null;
    case 'south': return sRow < 7 ? { screenIndex: ((sRow + 1) << 3) | sCol, tile: { row: 0, col: at.col } } : null;
    case 'west': return sCol > 0 ? { screenIndex: (sRow << 3) | (sCol - 1), tile: { row: at.row, col: 63 } } : null;
    case 'east': return sCol < 7 ? { screenIndex: (sRow << 3) | (sCol + 1), tile: { row: at.row, col: 0 } } : null;
  }
};

export { floodOneScreen, propagateArea };
export type { ScreenFloodRequest, ScreenFloodResult, AreaFloodRequest };
