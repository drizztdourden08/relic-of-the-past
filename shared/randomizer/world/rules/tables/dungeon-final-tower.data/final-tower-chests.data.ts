/* @layer shared-game @kind data */
import type { LocationKey } from '../../../location-key.type';

const RANDOMIZER_ROOM_CHESTS: readonly LocationKey[] = [
  'check-249',
  'check-250',
  'check-251',
  'check-252',
];

const COMPASS_ROOM_CHESTS: readonly LocationKey[] = [
  'check-239',
  'check-240',
  'check-241',
  'check-242',
  'check-264',
];

const BACK_CHESTS: readonly LocationKey[] = [
  'check-253',
  'check-254',
  'check-255',
  'check-256',
  'check-257',
];

const DMS_ROOM_CHESTS: readonly LocationKey[] = [
  'check-243',
  'check-244',
  'check-245',
  'check-246',
];

const BOTTOM_FIGHT_CHESTS: readonly LocationKey[] = ['check-255', 'check-257', 'check-256'];

export { BACK_CHESTS, BOTTOM_FIGHT_CHESTS, COMPASS_ROOM_CHESTS, DMS_ROOM_CHESTS, RANDOMIZER_ROOM_CHESTS };
