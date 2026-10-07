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
  // The face buttons are named here instead of left to SDL's live label,
  // because buttonIcons below already commits this family to the layout.
  // SOUTH draws xbox_button_a.svg, so SOUTH is A, and the label is the same
  // fact as the icon. Every reader with no live device to ask (a saved binding
  // for an unplugged pad, buildConsoleDefaultMappings, the synthetic profile
  // buildDeviceProfileFromSdlType builds) would otherwise fall through to
  // generic's "Button 1 (South)" beside the correct A glyph. D-pad and
  // shoulders still come from the chain: generic's "D-Pad Up" and "Left Bumper"
  // are what this pad is printed with.
  buttonLabels: {
    SOUTH: 'A',
    EAST: 'B',
    WEST: 'X',
    NORTH: 'Y',
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
  // Movement's DEFAULT is the left stick, not these four d-pad entries: the
  // stick half lives once on the generic family (axisConsoleDefaults), which
  // is the terminal fallback in this chain, so it applies here without being
  // repeated. The d-pad entries below are movement's second binding, since a pad
  // moves on both out of the box. They also feed the glyph packs' layout.
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
