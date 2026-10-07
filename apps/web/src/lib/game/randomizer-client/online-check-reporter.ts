/* @layer bridge-wasm @kind logic */
/**
 * A check the poller saw complete, on its way to the room: the goal's own check sends the goal,
 * and a check with a server id is remembered (a reconnect resends it) and sent while connected.
 */
import { log } from '../../log-bus';
import { GOAL_CHECK } from './online-goal';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { ApClientPacket } from './ap-protocol.type';
import type { GoalReporter } from './online-goal';
import type { OnlineRoom } from './online-room';
import type { ScoutMaps } from './online-overrides';

interface CheckReporterDeps {
  room: OnlineRoom;
  maps: ScoutMaps;
  goal: GoalReporter;
  send(packet: ApClientPacket): void;
}

const createCheckReporter = (deps: CheckReporterDeps) => {
  const { room, maps, goal, send } = deps;
  return (location: LocationKey): void => {
    log.randomizer(`[Online] Check completed: ${location}`);
    if (location === GOAL_CHECK) goal.report();
    const locationId = maps.locationIdByKey.get(location);
    if (locationId === undefined) return;
    room.reportedLocal.add(locationId);
    if (room.connected) send({ cmd: 'LocationChecks', locations: [locationId] });
  };
};

export { createCheckReporter };
