/* @layer renderer-widgets @kind data */
/**
 * Field probe that fills in `placement.tiles` — the migration codemod left
 * ~700 points with an empty tile list because a static rewrite has no way to
 * read the room's own geometry (see the connection-model migration report).
 * The live pass can: indoors, `wasmGetRoomWalkBoundaries` enumerates every
 * walk-boundary TILE together with the room it leads to (`destRoom`), so
 * every tile sharing this point's destination room IS its footprint. The
 * table enumerates the whole wall, so an empty result is proof, not silence
 * — this grades `certain`, same as `indoor-edge.set.ts`'s own read of the
 * identical table.
 *
 * Gated on BOTH `walkBoundaries` AND `doorBoundaries` being present, mirroring
 * `indoor-edge.set.ts`: the two tables are read together for one room, so
 * either both were queried this pass or neither was — `doorBoundaries` is
 * still not consulted for identity here (it carries no destination of its
 * own), only as that same completeness gate.
 *
 * Only applies to a point anchored on the CURRENTLY LOADED room: the walk
 * table is a live read of whichever room is loaded right now, so it can only
 * speak for a point whose own `screenId` resolves to that room, never for
 * the arriving side of a crossing that happens to also show up in
 * `existingConnections` (see that field's own comment on why both sides land
 * there).
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
