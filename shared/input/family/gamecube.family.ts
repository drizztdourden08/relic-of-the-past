/* @layer shared-input @kind data */
/**
 * GameCube family display metadata (wireless GameCube controller report). Icons and console
 * defaults only; no parsing.
 *
 * Measured from a real pad (057e:2073, sdlType 'gamecube'): 16 buttons (SOUTH/EAST/WEST/NORTH,
 * GUIDE, START, LEFT_SHOULDER/RIGHT_SHOULDER, d-pad, MISC1-4) and 6 axes including the triggers.
 * No BACK (no Select) and no stick clicks, so neither gets metadata.
 *
 * RIGHT_SHOULDER is the Z button, not a right bumper. MISC1 is Capture, MISC2 the C button.
 * MISC3/MISC4 are the digital clicks at the bottom of the L/R triggers' analog travel (the same
 * pull that drives LEFT_TRIGGER/RIGHT_TRIGGER), so they are labelled and iconed as that click.
 */

import { registerFamily } from './family-registry';
import type { FamilyMetadata } from './family.type';

const GAMECUBE_FAMILY: FamilyMetadata = {
  types: ['gamecube'],
  brandLogoKey: 'nintendo',
  // Face/d-pad labels come from SDL's own per-device label; these cover
  // positions SDL does not label at all (system buttons, the Z shoulder,
  // and the trigger-click buttons).
  buttonLabels: {
    START: 'Start',
    GUIDE: 'Home',
    RIGHT_SHOULDER: 'Z',
    MISC1: 'Capture',
    MISC2: 'C Button',
    MISC3: 'L Trigger Click',
    MISC4: 'R Trigger Click',
  },
  axisLabels: {
    LEFT_X: 'Left Stick X',
    LEFT_Y: 'Left Stick Y',
    RIGHT_X: 'C-Stick X',
    RIGHT_Y: 'C-Stick Y',
    LEFT_TRIGGER: 'L Trigger',
    RIGHT_TRIGGER: 'R Trigger',
  },
  buttonIcons: {
    SOUTH: 'gc-a',
    // SDL's own EAST/WEST labels are correct (EAST is X, WEST is B); only
    // the glyphs were crossed, so this pairs each position with its own icon.
    EAST: 'gc-x',
    WEST: 'gc-b',
    NORTH: 'gc-y',
    LEFT_SHOULDER: 'gc-l',
    RIGHT_SHOULDER: 'gc-zr',
    START: 'gc-start',
    DPAD_UP: 'gc-dup',
    DPAD_DOWN: 'gc-ddown',
    DPAD_LEFT: 'gc-dleft',
    DPAD_RIGHT: 'gc-dright',
    GUIDE: 'gc-home',
    MISC1: 'gc-capture',
    // gc_button_c.svg is mislabeled on disk: despite its name it is the C
    // stick artwork (see axisIcons below), not a button glyph. The genuine
    // white round C button glyph lives at gc_button_chat.svg.
    MISC2: 'gc-chat',
    // Reuse the analog trigger glyphs: these are that same trigger's full
    // press, not a separate control.
    MISC3: 'gc-l',
    MISC4: 'gc-r',
  },
  // One base icon key per stick (the right stick is the C-stick); direction glyphs and the
  // neutral pose are inferred at render time (resolveStickDirectionIcon).
  axisIcons: {
    LEFT_X: 'gc-stick-l',
    LEFT_Y: 'gc-stick-l',
    RIGHT_X: 'gc-stick-c',
    RIGHT_Y: 'gc-stick-c',
    LEFT_TRIGGER: 'gc-l',
    RIGHT_TRIGGER: 'gc-r',
  },
  // SNES L/R land on the trigger clicks (MISC3/MISC4), not on LEFT_SHOULDER/RIGHT_SHOULDER:
  // RIGHT_SHOULDER is Z on this pad, and the player expects R on the trigger's own click.
  // Z stays unbound by default.
  consoleDefaults: {
    SOUTH: 'A',
    EAST: 'B',
    WEST: 'X',
    NORTH: 'Y',
    MISC3: 'L',
    MISC4: 'R',
    START: 'Start',
    DPAD_UP: 'Up',
    DPAD_DOWN: 'Down',
    DPAD_LEFT: 'Left',
    DPAD_RIGHT: 'Right',
  },
  // A licensed wireless GameCube-style pad uses an ERM motor with real spin-up lag (unlike
  // the Switch Pro's near-instant LRA), so a short burst can end before the motor has
  // accelerated and plays as barely perceptible. Stretch it out (minDurationMs below), not
  // only boost amplitude.
  minDurationMs: 90,
};

registerFamily(GAMECUBE_FAMILY);

export { GAMECUBE_FAMILY };
