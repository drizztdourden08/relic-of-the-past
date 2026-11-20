/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { OUTSIDE_SWEEP } from './check-grouping.constants';

const FIXED_GROUP_VALUE_LABELS: Record<string, Text> = {
  'Light World': msg('game-labels:group.lightWorld'),
  'Dark World': msg('game-labels:group.darkWorld'),
  Dungeon: msg('game-labels:group.dungeon'),
  Cave: msg('game-labels:group.cave'),
  House: msg('game-labels:group.house'),
  Overworld: msg('game-labels:group.overworld'),
  Keys: msg('game-labels:group.keys'),
  'Big Keys': msg('game-labels:group.bigKeys'),
  'Map/Compass': msg('game-labels:group.mapCompass'),
  'Boss Items': msg('game-labels:group.bossItems'),
  Other: msg('game-labels:group.other'),
  Unknown: msg('game-labels:group.unknown'),
  'All Checks': msg('game-labels:group.allChecks'),
  [OUTSIDE_SWEEP]: msg('game-labels:group.outsideSweep'),
};

const SPHERE_PREFIX = 'Sphere ';

export { FIXED_GROUP_VALUE_LABELS, SPHERE_PREFIX };
