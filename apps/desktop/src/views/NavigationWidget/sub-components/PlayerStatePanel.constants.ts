/* @layer renderer-widgets @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
const COLLISION_NAMES: readonly Message[] = [
  msg('views-navigation:collision.0'),
  msg('views-navigation:collision.1'),
  msg('views-navigation:collision.2'),
  msg('views-navigation:collision.3'),
  msg('views-navigation:collision.4'),
];

const STAIRCASE_NAMES: readonly Message[] = [msg('views-navigation:staircase.0'), msg('views-navigation:staircase.1'), msg('views-navigation:staircase.2')];

const BLOCKED_STAIRCASE = 2;

export { BLOCKED_STAIRCASE, COLLISION_NAMES, STAIRCASE_NAMES };
