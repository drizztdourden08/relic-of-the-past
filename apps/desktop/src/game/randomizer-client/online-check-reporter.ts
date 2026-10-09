/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { GOAL_CHECK } from '@rotp/randomizer';
import type { LocationKey } from '@rotp/randomizer';
import type { CheckReporterDeps } from '@rotp/randomizer';

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
