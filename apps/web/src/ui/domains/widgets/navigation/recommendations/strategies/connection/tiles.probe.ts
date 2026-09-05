/* @layer renderer-widgets @kind data */
/**
 * Field probe that fills in `placement.tiles`. The migration codemod left
 * ~700 points with an empty tile list because a static rewrite cannot read
 * the room's geometry. Indoors, `wasmGetRoomWalkBoundaries` enumerates every
 * walk-boundary TILE with the room it leads to (`destRoom`), so every tile
 * sharing this point's destination room IS its footprint. The table
 * enumerates the whole wall, so an empty result is proof, not silence; this
 * grades `certain`, same as `indoor-edge.set.ts`.
 *
 * Gated on BOTH `walkBoundaries` AND `doorBoundaries` being present, mirroring
 * `indoor-edge.set.ts`: the two tables are read together for one room, so
 * either both were queried this pass or neither was.
 *
 * Only applies to a point anchored on the CURRENTLY LOADED room: the walk
 * table is a live read of that room, so it cannot speak for the arriving side
 * of a crossing that also shows up in `existingConnections`.
 */
import { getScreen } from '@shared/game/data';
import { toScreenIdOf } from '@shared/game/data/connections/derive';
import type { ConnectionTile } from '@shared/game/data';
import { known, unread } from '@shared/game/recommendations/compare';
import type { FieldProbe } from '@shared/game/recommendations/compare';
import type { LiveWalkBoundary, ScreenObservations } from '@shared/game/recommendations';

const isCurrentRoom = (observations: ScreenObservations, screenId: string): boolean => {
  const live = observations.liveGameId;
  if (!live || live.roomIndex == null) return false;
  return getScreen(screenId).gameId.roomIndex === live.roomIndex;
};

/** Every walk-boundary tile leading to `destRoom`, as base tiles. */
const tilesFor = (boundaries: readonly LiveWalkBoundary[], destRoom: number): ConnectionTile[] =>
  boundaries.filter(b => b.destRoom === destRoom).map(b => ({ x: b.col, y: b.row }));

const TILES_PROBE: FieldProbe<'connection'> = {
  path: 'placement.tiles',
  label: 'Tile footprint',
  source: 'native:room-boundaries',
  confidence: 'certain',
  applies: (observations, record) =>
    !!observations.walkBoundaries && !!observations.doorBoundaries
    && record.placement.tiles.length === 0
    && isCurrentRoom(observations, record.screenId),
  read: (observations, record) => {
    if (!observations.walkBoundaries) return unread();
    const destRoom = getScreen(toScreenIdOf(record)).gameId.roomIndex;
    if (destRoom == null) return unread();
    const tiles = tilesFor(observations.walkBoundaries, destRoom);
    return tiles.length > 0 ? known(tiles) : unread();
  },
};

export { TILES_PROBE };
