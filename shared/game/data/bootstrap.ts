/* @layer shared-game @kind logic */
/**
 * The ONLY seeding path: every kind is populated the moment this module is first
 * imported. Synchronous, no network I/O, no second source — the records are
 * typed .ts files compiled into the bundle, so tests and any other consumer get
 * real data with no await and no async gap.
 */
import { replaceAll } from './registry';
import { rebuild } from './indexes';
import { ALL_SCREENS } from './screens';
import { ALL_CONNECTIONS } from './connections';
import { ALL_CHECKS } from './checks';
import { ALL_ITEMS } from './items';
import { ALL_ACTORS } from './actors';
import { DUNGEONS } from './dungeons';
import { AREAS } from './areas';
import { LOCATIONS } from './locations';

replaceAll('screen', ALL_SCREENS);
replaceAll('connection', ALL_CONNECTIONS);
replaceAll('check', ALL_CHECKS);
replaceAll('item', ALL_ITEMS);
replaceAll('actor', ALL_ACTORS);
replaceAll('dungeon', DUNGEONS);
replaceAll('area', AREAS);
replaceAll('location', LOCATIONS);
rebuild();
