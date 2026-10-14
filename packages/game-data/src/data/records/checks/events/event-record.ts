/* @layer shared-game @kind logic */
import type { CheckRecord } from '../../../types';
import type { EventSpec } from '../../../checks/event-spec.type';
import { eventId } from '../../../checks/event-id';
import { EVENT_SCREENS } from './event-screens.constants';
import { EVENT_REGIONS } from './event-regions.constants';

const placementFields = (spec: EventSpec): Partial<CheckRecord> => {
  const { n, dungeonId, subArea } = spec;
  return {
    ...(EVENT_SCREENS[n] !== undefined ? { screenId: EVENT_SCREENS[n] } : {}),
    ...(EVENT_REGIONS[n] !== undefined ? { regionId: EVENT_REGIONS[n] } : {}),
    ...(dungeonId !== undefined ? { dungeonId } : {}),
    ...(subArea !== undefined ? { subArea } : {}),
  };
};

const reachFields = (spec: EventSpec): Partial<CheckRecord> => {
  const { derived, reachAny, now, derivedDungeon } = spec;
  return {
    ...(derived !== undefined ? { derived } : {}),
    ...(reachAny !== undefined ? { reachAny } : {}),
    ...(now !== undefined ? { now } : {}),
    ...(derivedDungeon !== undefined ? { derivedDungeon } : {}),
  };
};

const flagFields = (spec: EventSpec): Partial<CheckRecord> => {
  const { statusOnly, requirements, actorId } = spec;
  return {
    ...(statusOnly ? { statusOnly } : {}),
    ...(requirements !== undefined ? { requirements } : {}),
    ...(actorId !== undefined ? { actorId } : {}),
  };
};

const eventRecord = (spec: EventSpec): CheckRecord => {
  const { n, name, group, gameId = {} } = spec;
  return {
    id: eventId(n),
    gameId,
    kind: 'event',
    name,
    vanillaItemIds: [],
    eventGroup: group,
    ...placementFields(spec),
    ...reachFields(spec),
    ...flagFields(spec),
  };
};

export { eventRecord };
