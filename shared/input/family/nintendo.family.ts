/* @layer shared-input @kind data */
/**
 * Nintendo family display metadata: the Switch Pro Controller and the three
 * Joy-Con reports (left, right, paired). Icons and console defaults only,
 * carried over from the existing switch-pro presets; no parsing and no
 * decision about what a device has.
 */

import { registerFamily } from './family-registry';
import type { FamilyMetadata } from './family.type';

const NINTENDO_FAMILY: FamilyMetadata = {
  types: ['switch-pro', 'joycon-left', 'joycon-right', 'joycon-pair'],
  brandLogoKey: 'nintendo',
  // Face/d-pad/shoulder labels come from SDL's own per-device label; these
  // cover positions SDL does not label at all (system buttons, stick clicks).
  buttonLabels: {
    LEFT_STICK: 'L Stick',
    RIGHT_STICK: 'R Stick',
    BACK: 'Minus',
    START: 'Plus',
    GUIDE: 'Home',
    MISC1: 'Capture',
    MISC2: 'C Button',
    LEFT_PADDLE1: 'GL',
    RIGHT_PADDLE1: 'GR',
  },
  axisLabels: {
    LEFT_X: 'Left Stick X',
    LEFT_Y: 'Left Stick Y',
    RIGHT_X: 'Right Stick X',
    RIGHT_Y: 'Right Stick Y',
    LEFT_TRIGGER: 'ZL Trigger',
    RIGHT_TRIGGER: 'ZR Trigger',
  },
  buttonIcons: {
    SOUTH: 'switch-b',
    EAST: 'switch-a',
    WEST: 'switch-y',
    NORTH: 'switch-x',
    LEFT_SHOULDER: 'switch-l',
    RIGHT_SHOULDER: 'switch-r',
    BACK: 'switch-minus',
    START: 'switch-plus',
    DPAD_UP: 'switch-dup',
    DPAD_DOWN: 'switch-ddown',
    DPAD_LEFT: 'switch-dleft',
    DPAD_RIGHT: 'switch-dright',
    LEFT_STICK: 'switch-ls',
    RIGHT_STICK: 'switch-rs',
    GUIDE: 'switch-home',
    MISC1: 'switch-capture',
    MISC2: 'switch-c',
    LEFT_PADDLE1: 'switch-gl',
    RIGHT_PADDLE1: 'switch-gr',
  },
  // LEFT_X/LEFT_Y (and RIGHT_X/RIGHT_Y) share one base icon key per stick.
  // The four direction glyphs and the neutral pose are inferred from the
  // live axis pair at render time (see resolveStickDirectionIcon), never
  // configured per direction here.
  axisIcons: {
    LEFT_X: 'switch-stick-l',
    LEFT_Y: 'switch-stick-l',
    RIGHT_X: 'switch-stick-r',
    RIGHT_Y: 'switch-stick-r',
    LEFT_TRIGGER: 'switch-zl',
    RIGHT_TRIGGER: 'switch-zr',
  },
  consoleDefaults: {
    SOUTH: 'B',
    EAST: 'A',
    WEST: 'Y',
    NORTH: 'X',
    LEFT_SHOULDER: 'L',
    RIGHT_SHOULDER: 'R',
    BACK: 'Select',
    START: 'Start',
    DPAD_UP: 'Up',
    DPAD_DOWN: 'Down',
    DPAD_LEFT: 'Left',
    DPAD_RIGHT: 'Right',
  },
};

registerFamily(NINTENDO_FAMILY);

export { NINTENDO_FAMILY };
