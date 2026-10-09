/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { GOAL_CHECK } from './online-goal';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { CheckReporterDeps } from './online-check-reporter.type';

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
