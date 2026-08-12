/* @layer shared-input @kind data */
/**
 * GameCube family display metadata: the wireless GameCube controller
 * report. Icons and console defaults only; no parsing and no decision about
 * what a device has.
 *
 * Measured from a real pad (057e:2073, sdlType 'gamecube'): 16 buttons,
 * namely SOUTH/EAST/WEST/NORTH, GUIDE, START, LEFT_SHOULDER/RIGHT_SHOULDER,
 * the d-pad, and MISC1-4, plus 6 axes including LEFT_TRIGGER/RIGHT_TRIGGER.
 * There is no BACK (a GameCube pad has no Select) and no stick-click buttons,
 * so neither gets metadata here.
 *
 * RIGHT_SHOULDER is the Z button, not a right bumper. LEFT_SHOULDER is the
 * ordinary L shoulder and needs no override. MISC1 is Capture, MISC2 is the
 * C button. MISC3/MISC4 are the digital clicks at the bottom of the L/R
 * trigger's analog travel, the same physical pull that also drives
 * LEFT_TRIGGER/RIGHT_TRIGGER as an axis, so they are labelled and iconed to
 * read as that click, not as two more mystery buttons.
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
  // LEFT_X/LEFT_Y (and RIGHT_X/RIGHT_Y, the C-stick) share one base icon key
  // per stick. The four direction glyphs and the neutral pose are inferred
  // from the live axis pair at render time (see resolveStickDirectionIcon),
  // never configured per direction here.
  axisIcons: {
    LEFT_X: 'gc-stick-l',
    LEFT_Y: 'gc-stick-l',
    RIGHT_X: 'gc-stick-c',
    RIGHT_Y: 'gc-stick-c',
    LEFT_TRIGGER: 'gc-l',
    RIGHT_TRIGGER: 'gc-r',
  },
  // SNES L/R land on the digital clicks at the bottom of the analog
  // triggers' travel (MISC3/MISC4), not on LEFT_SHOULDER/RIGHT_SHOULDER —
  // RIGHT_SHOULDER is the Z button on this pad, and binding SNES R there
  // would put Z where the player expects the trigger's own click. Z stays
  // unbound by default.
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
  // A licensed wireless GameCube-style pad uses an ERM motor with real mechanical
  // spin-up lag, unlike the Switch Pro's HD-rumble LRA, which responds to a pulse
  // almost instantly. A short authored burst can end before the motor has finished
  // accelerating, so it plays as barely perceptible even at full amplitude. Stretch
  // it out (see minDurationMs below) rather than only pushing amplitude higher.
  minDurationMs: 90,
};

registerFamily(GAMECUBE_FAMILY);

export { GAMECUBE_FAMILY };
