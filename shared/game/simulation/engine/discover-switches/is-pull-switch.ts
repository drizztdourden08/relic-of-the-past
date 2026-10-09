/* @layer shared-game @kind logic */
import { PULL_SWITCH_FIRST, PULL_SWITCH_LAST } from './discover-switches.constants';

const isPullSwitch = (spriteType: number): boolean => spriteType >= PULL_SWITCH_FIRST && spriteType <= PULL_SWITCH_LAST;

export { isPullSwitch };
