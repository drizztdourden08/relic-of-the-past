/* @layer shared-game @kind constants */
import type { DrainSwitch } from './discover-switches.type';

const PULL_SWITCH_FIRST = 0x04;
const PULL_SWITCH_LAST = 0x07;

const DRAIN_SWITCHES: ReadonlyArray<DrainSwitch> = [
  { switchRoom: 0x10b, screen: 0x3b, mask: 0x20 },
];

export { PULL_SWITCH_FIRST, PULL_SWITCH_LAST, DRAIN_SWITCHES };
