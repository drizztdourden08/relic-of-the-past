/* @layer renderer-widgets @kind logic */
import { get, toScreenIdOrNone } from '@rotp/game-data';
import type { ConnectionRecord, ConnectionTile } from '@rotp/game-data';
import { known, unread } from '@shared/game/recommendations/compare';
import type { LiveWalkBoundary, ScreenObservations } from '@shared/game/recommendations';

const tilesFor = (boundaries: readonly LiveWalkBoundary[], destRoom: number): ConnectionTile[] =>
  boundaries.filter(b => b.destRoom === destRoom).map(b => ({ x: b.col, y: b.row }));

const readTilesProbe = (observations: ScreenObservations, record: ConnectionRecord) => {
  if (!observations.walkBoundaries) return unread();
  const other = toScreenIdOrNone(record);
  const destRoom = other === undefined ? null : get('screen', other)?.gameId.roomIndex;
  if (destRoom == null) return unread();
  const tiles = tilesFor(observations.walkBoundaries, destRoom);
  return tiles.length > 0 ? known(tiles) : unread();
};

export { readTilesProbe };
