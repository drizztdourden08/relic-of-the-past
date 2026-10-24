/* @layer renderer-components @kind constants */
import { crossGlyph } from './behavior/cross-glyph';
import type { CrossGlyph, DpadDirection, DpadPressState } from './DpadCross.type';

const DPAD_DIRECTIONS: readonly DpadDirection[] = ['up', 'right', 'down', 'left'];

const IDLE_DPAD: DpadPressState = { up: false, right: false, down: false, left: false };

const CROSS_GLYPH: CrossGlyph = crossGlyph();

export { CROSS_GLYPH, DPAD_DIRECTIONS, IDLE_DPAD };
