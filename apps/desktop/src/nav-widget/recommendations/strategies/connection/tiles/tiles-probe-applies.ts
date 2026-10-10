/* @layer renderer-widgets @kind logic */
import type { ConnectionRecord } from '@rotp/game-data';
import type { ScreenObservations } from '@rotp/navigation';
import { isCurrentRoom } from './is-current-room';

const tilesProbeApplies = (observations: ScreenObservations, record: ConnectionRecord): boolean =>
  Boolean(observations.walkBoundaries) && Boolean(observations.doorBoundaries)
  && record.placement.tiles.length === 0
  && isCurrentRoom(observations, record.screenId);

export { tilesProbeApplies };
