/* @layer shared-game @kind logic */
import type { CheckRecord } from '@shared/game/data/types';
import type { EventSpec } from '@shared/game/data/checks/event-spec.type';
import { eventId } from '@shared/game/data/checks/event-id';
import { EVENT_SCREENS } from './event-screens.data';
import { EVENT_REGIONS } from './event-regions.data';

const eventRecord = (spec: EventSpec): CheckRecord => {
  const { n, name, group, gameId = {}, dungeonId, subArea, derived, reachAny, now, derivedDungeon, statusOnly, requirements, actorId } = spec;
  return {
    id: eventId(n),
    gameId,
    kind: 'event',
    name: name,
    vanillaItemIds: [],
    eventGroup: group,
    ...(EVENT_SCREENS[n] !== undefined ? { screenId: EVENT_SCREENS[n] } : {}),
    ...(EVENT_REGIONS[n] !== undefined ? { regionId: EVENT_REGIONS[n] } : {}),
    ...(dungeonId !== undefined ? { dungeonId } : {}),
    ...(subArea !== undefined ? { subArea } : {}),
    ...(derived !== undefined ? { derived } : {}),
    ...(reachAny !== undefined ? { reachAny } : {}),
    ...(now !== undefined ? { now } : {}),
    ...(derivedDungeon !== undefined ? { derivedDungeon } : {}),
    ...(statusOnly ? { statusOnly } : {}),
    ...(requirements !== undefined ? { requirements } : {}),
    ...(actorId !== undefined ? { actorId } : {}),
  };
};

export { eventRecord };
