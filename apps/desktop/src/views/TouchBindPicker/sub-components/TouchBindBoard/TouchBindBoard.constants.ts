/* @layer renderer-app @kind constants */
import type { DpadReading } from '@rotp/input-mapping';

const BOARD_STRENGTH = 1;

const NO_PRESS: DpadReading = { up: false, down: false, left: false, right: false };

export { BOARD_STRENGTH, NO_PRESS };
