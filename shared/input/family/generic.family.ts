/* @layer shared-input @kind data */
/**
 * Generic family display metadata: the fallback for 'standard' (a device
 * the platform already normalizes) and 'unknown' (a device SDL cannot
 * classify at all). This is the Null Object of the family layer; every
 * lookup lands here eventually, so it always answers instead of leaving a
 * gap for a caller to branch around. Icons carried over from the existing
 * generic preset.
 */

import { registerFamily } from './family-registry';
import type { FamilyMetadata } from './family.type';

const GENERIC_FAMILY: FamilyMetadata = {
  types: ['standard', 'unknown'],
  brandLogoKey: 'generic',
  // This is also the terminal fallback (ctx.generic) for every OTHER family's
  // chain, and the only thing standing behind an 'unknown' device that no
  // specific family claims. So unlike the named families above, every
  // position is covered here, buttons and axes alike. Nothing may reach the
  // bare positional name or an empty icon string once this has answered.
  buttonLabels: {
    SOUTH: 'Button 1 (South)',
    EAST: 'Button 2 (East)',
    WEST: 'Button 3 (West)',
    NORTH: 'Button 4 (North)',
    LEFT_SHOULDER: 'Left Bumper',
    RIGHT_SHOULDER: 'Right Bumper',
    BACK: 'Select / Back',
    START: 'Start / Menu',
    DPAD_UP: 'D-Pad Up',
    DPAD_DOWN: 'D-Pad Down',
    DPAD_LEFT: 'D-Pad Left',
    DPAD_RIGHT: 'D-Pad Right',
    LEFT_STICK: 'Left Stick Click',
    RIGHT_STICK: 'Right Stick Click',
    GUIDE: 'Home / Guide',
    MISC1: 'Extra 1',
    MISC2: 'Extra 2',
    MISC3: 'Extra 3',
    MISC4: 'Extra 4',
    MISC5: 'Extra 5',
    MISC6: 'Extra 6',
    LEFT_PADDLE1: 'Left Paddle 1',
    RIGHT_PADDLE1: 'Right Paddle 1',
    LEFT_PADDLE2: 'Left Paddle 2',
    RIGHT_PADDLE2: 'Right Paddle 2',
    TOUCHPAD: 'Touchpad',
  },
  axisLabels: {
    LEFT_X: 'Left Stick X',
    LEFT_Y: 'Left Stick Y',
    RIGHT_X: 'Right Stick X',
    RIGHT_Y: 'Right Stick Y',
    LEFT_TRIGGER: 'Left Trigger',
    RIGHT_TRIGGER: 'Right Trigger',
  },
  buttonIcons: {
    SOUTH: 'generic-btn',
    EAST: 'generic-btn-circle',
    WEST: 'generic-btn-square',
    NORTH: 'generic-btn',
    LEFT_SHOULDER: 'generic-trigger-a',
    RIGHT_SHOULDER: 'generic-trigger-b',
    BACK: 'generic-btn',
    START: 'generic-btn',
    DPAD_UP: 'generic-stick-up',
    DPAD_DOWN: 'generic-stick-down',
    DPAD_LEFT: 'generic-stick-left',
    DPAD_RIGHT: 'generic-stick-right',
    LEFT_STICK: 'generic-stick-press',
    RIGHT_STICK: 'generic-stick-press',
    GUIDE: 'generic-btn',
    MISC1: 'generic-btn',
    MISC2: 'generic-btn',
    MISC3: 'generic-btn',
    MISC4: 'generic-btn',
    MISC5: 'generic-btn',
    MISC6: 'generic-btn',
    LEFT_PADDLE1: 'generic-trigger-a',
    RIGHT_PADDLE1: 'generic-trigger-b',
    LEFT_PADDLE2: 'generic-trigger-a',
    RIGHT_PADDLE2: 'generic-trigger-b',
    TOUCHPAD: 'generic-btn-square',
  },
  axisIcons: {
    LEFT_X: 'generic-stick',
    LEFT_Y: 'generic-stick',
    RIGHT_X: 'generic-stick',
    RIGHT_Y: 'generic-stick',
    LEFT_TRIGGER: 'generic-trigger-a',
    RIGHT_TRIGGER: 'generic-trigger-b',
  },
  // The d-pad entries stay. They are movement's SECOND default binding, not
  // its only one (see axisConsoleDefaults), and this table is also read as a
  // position -> console button LAYOUT by the built-in glyph packs
  // (shared/input/glyphs/built-in-packs.ts): dropping the four directions
  // here would silently strip the d-pad glyphs out of the Console and
  // Keyboard packs, which has nothing to do with what a pad is bound to.
  consoleDefaults: {
    SOUTH: 'A',
    EAST: 'B',
    WEST: 'X',
    NORTH: 'Y',
    LEFT_SHOULDER: 'L',
    RIGHT_SHOULDER: 'R',
    BACK: 'Select',
    START: 'Start',
    DPAD_UP: 'Up',
    DPAD_DOWN: 'Down',
    DPAD_LEFT: 'Left',
    DPAD_RIGHT: 'Right',
  },
  // MOVEMENT'S DEFAULT, FOR EVERY GAMEPAD FAMILY. SDL normalizes the left
  // stick to LEFT_X/LEFT_Y whatever the pad is, and this family is the
  // terminal fallback in every other family's resolve chain, so one table
  // here is the whole answer for Nintendo, Xbox, PlayStation, GameCube and
  // unrecognized pads alike. A family that ever needs to disagree overrides
  // it the same way it overrides any other field.
  //
  // SDL's Y axis points down, so '-' is up and '+' is down.
  axisConsoleDefaults: {
    LEFT_X: { '-': 'Left', '+': 'Right' },
    LEFT_Y: { '-': 'Up', '+': 'Down' },
  },
};

registerFamily(GENERIC_FAMILY);

export { GENERIC_FAMILY };
