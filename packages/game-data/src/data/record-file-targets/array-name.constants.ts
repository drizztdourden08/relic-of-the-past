/* @layer shared-game @kind constants */
const ARRAY_SUFFIX: Readonly<Record<string, string>> = {
  screens: 'SCREENS', connections: 'CONNECTIONS', checks: 'CHECKS', items: 'ITEMS',
  actors: 'ACTORS', dungeons: 'DUNGEON', areas: 'AREAS', locations: 'LOCATIONS',
  regions: 'REGIONS',
};

const EVENTS_FOLDER = 'checks/events/';

export { ARRAY_SUFFIX, EVENTS_FOLDER };
