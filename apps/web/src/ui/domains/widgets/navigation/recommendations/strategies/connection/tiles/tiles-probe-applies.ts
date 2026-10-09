/* @layer renderer-widgets @kind logic */
import type { ConnectionRecord } from '@shared/game/data';
import type { ScreenObservations } from '@shared/game/recommendations';
import { isCurrentRoom } from './is-current-room';

const tilesProbeApplies = (observations: ScreenObservations, record: ConnectionRecord): boolean =>
  !!observations.walkBoundaries && !!observations.doorBoundaries
  && record.placement.tiles.length === 0
  && isCurrentRoom(observations, record.screenId);

export { tilesProbeApplies };
