/* @layer renderer-components @kind constants */
import type { DpadDirection, DpadWedgeState } from './DpadWedges.type';

const DPAD_DIRECTIONS: readonly DpadDirection[] = ['up', 'right', 'down', 'left'];

const DPAD_BOX = 100;

const WEDGE_POINTS: Readonly<Record<DpadDirection, string>> = {
  up: '33,0 67,0 67,30.88 50,47.88 33,30.88',
  right: '100,33 100,67 69.12,67 52.12,50 69.12,33',
  down: '67,100 33,100 33,69.12 50,52.12 67,69.12',
  left: '0,67 0,33 30.88,33 47.88,50 30.88,67',
};

const IDLE_DPAD: DpadWedgeState = { up: false, right: false, down: false, left: false };

export { DPAD_BOX, DPAD_DIRECTIONS, IDLE_DPAD, WEDGE_POINTS };
