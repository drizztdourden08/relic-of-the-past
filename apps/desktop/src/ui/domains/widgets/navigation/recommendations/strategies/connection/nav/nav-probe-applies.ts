/* @layer renderer-widgets @kind logic */
import type { ConnectionRecord } from '@rotp/game-data';
import type { ScreenObservations } from '@shared/game/recommendations';
import { endpointsResolvable } from './endpoints-resolvable';

const navProbeApplies = (_observations: ScreenObservations, record: ConnectionRecord): boolean =>
  !record.nav && endpointsResolvable(record);

export { navProbeApplies };
