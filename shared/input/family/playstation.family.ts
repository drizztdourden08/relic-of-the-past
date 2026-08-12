/* @layer shared-input @kind data */
/**
 * PlayStation family display metadata: PS3, PS4 and PS5 reports (covers
 * DualShock 4, DualSense and DualSense Edge). Icons and console defaults
 * only, carried over from the existing playstation preset; no parsing and
 * no decision about what a device has.
 */

import { registerFamily } from './family-registry';
import type { FamilyMetadata } from './family.type';

const PLAYSTATION_FAMILY: FamilyMetadata = {
  types: ['ps3', 'ps4', 'ps5'],
  brandLogoKey: 'playstation',
  // Face/d-pad/shoulder labels come from SDL's own per-device label; these
  // cover positions SDL does not label at all (system buttons, stick clicks).
  buttonLabels: {
    LEFT_STICK: 'L3 Stick',
    RIGHT_STICK: 'R3 Stick',
    BACK: 'Share',
    START: 'Options',
    GUIDE: 'PS Button',
    TOUCHPAD: 'Touchpad',
    MISC1: 'Mute',
  },
  axisLabels: {
    LEFT_X: 'Left Stick X',
    LEFT_Y: 'Left Stick Y',
    RIGHT_X: 'Right Stick X',
    RIGHT_Y: 'Right Stick Y',
    LEFT_TRIGGER: 'L2 Trigger',
    RIGHT_TRIGGER: 'R2 Trigger',
  },
  buttonIcons: {
    SOUTH: 'ps-cross',
    EAST: 'ps-circle',
    WEST: 'ps-square',
    NORTH: 'ps-triangle',
    LEFT_SHOULDER: 'ps-l1',
    RIGHT_SHOULDER: 'ps-r1',
    BACK: 'ps-share',
    START: 'ps-options',
    DPAD_UP: 'ps-dup',
    DPAD_DOWN: 'ps-ddown',
    DPAD_LEFT: 'ps-dleft',
    DPAD_RIGHT: 'ps-dright',
    LEFT_STICK: 'ps-l3',
    RIGHT_STICK: 'ps-r3',
    GUIDE: 'ps-home',
    TOUCHPAD: 'ps-touchpad',
    MISC1: 'ps-mute',
  },
  axisIcons: {
    LEFT_TRIGGER: 'ps-l2',
    RIGHT_TRIGGER: 'ps-r2',
  },
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
};

registerFamily(PLAYSTATION_FAMILY);

export { PLAYSTATION_FAMILY };
