/* @layer shared-input @kind data */
/**
 * Xbox family display metadata: Xbox 360 and Xbox One reports (Series X|S, Elite and Adaptive
 * all report as one of those two). Icons and console defaults only; no parsing.
 */

import { registerFamily } from './family-registry';
import type { FamilyMetadata } from './family.type';

const XBOX_FAMILY: FamilyMetadata = {
  types: ['xbox360', 'xboxone'],
  brandLogoKey: 'xbox',
  // Face/d-pad/shoulder labels come from SDL's own per-device label; these
  // cover positions SDL does not label at all (system buttons, stick clicks).
  buttonLabels: {
    LEFT_STICK: 'L Stick',
    RIGHT_STICK: 'R Stick',
    BACK: 'View',
    START: 'Menu',
    GUIDE: 'Xbox',
    MISC1: 'Share',
  },
  axisLabels: {
    LEFT_X: 'Left Stick X',
    LEFT_Y: 'Left Stick Y',
    RIGHT_X: 'Right Stick X',
    RIGHT_Y: 'Right Stick Y',
    LEFT_TRIGGER: 'L Trigger',
    RIGHT_TRIGGER: 'R Trigger',
  },
  buttonIcons: {
    SOUTH: 'xbox-a',
    EAST: 'xbox-b',
    WEST: 'xbox-x',
    NORTH: 'xbox-y',
    LEFT_SHOULDER: 'xbox-lb',
    RIGHT_SHOULDER: 'xbox-rb',
    BACK: 'xbox-view',
    START: 'xbox-menu',
    DPAD_UP: 'xbox-dup',
    DPAD_DOWN: 'xbox-ddown',
    DPAD_LEFT: 'xbox-dleft',
    DPAD_RIGHT: 'xbox-dright',
    LEFT_STICK: 'xbox-ls',
    RIGHT_STICK: 'xbox-rs',
    GUIDE: 'xbox-home',
    MISC1: 'xbox-share',
  },
  // One base icon key per stick; direction glyphs and the neutral pose are inferred at render
  // time (resolveStickDirectionIcon).
  axisIcons: {
    LEFT_X: 'xbox-stick-l',
    LEFT_Y: 'xbox-stick-l',
    RIGHT_X: 'xbox-stick-r',
    RIGHT_Y: 'xbox-stick-r',
    LEFT_TRIGGER: 'xbox-lt',
    RIGHT_TRIGGER: 'xbox-rt',
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
  // Xbox dual-rumble is a linear ERM magnitude that feels weak at low values (the motors barely
  // move below ~0.25), unlike Switch HD rumble's punchy pulses. Lift onto a floor and boost so
  // short combat pulses land hard. Strength only; duration is untouched.
  shapeVibration: (intensity) => (intensity <= 0 ? 0 : Math.min(1, 0.3 + intensity * 0.85)),
};

registerFamily(XBOX_FAMILY);

export { XBOX_FAMILY };
