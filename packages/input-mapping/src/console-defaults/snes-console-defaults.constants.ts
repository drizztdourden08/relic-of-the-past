/* @layer shared-input @kind constants */
import { GAMECUBE_FAMILY, GENERIC_FAMILY, NINTENDO_FAMILY, PLAYSTATION_FAMILY, XBOX_FAMILY } from '@drizztdourden08/brock-input';
import type { FamilyMetadata } from '@drizztdourden08/brock-input';
import type { SnesConsoleDefaults } from './snes-console-defaults.type';

const DPAD_AND_MENU = {
  BACK: 'Select',
  START: 'Start',
  DPAD_UP: 'Up',
  DPAD_DOWN: 'Down',
  DPAD_LEFT: 'Left',
  DPAD_RIGHT: 'Right',
} as const;

const STANDARD_BUTTONS = {
  SOUTH: 'A',
  EAST: 'B',
  WEST: 'X',
  NORTH: 'Y',
  LEFT_SHOULDER: 'L',
  RIGHT_SHOULDER: 'R',
  ...DPAD_AND_MENU,
} as const;

const GENERIC_DEFAULTS: SnesConsoleDefaults = {
  buttons: STANDARD_BUTTONS,
  axes: {
    LEFT_X: { '-': 'Left', '+': 'Right' },
    LEFT_Y: { '-': 'Up', '+': 'Down' },
  },
};

const SNES_CONSOLE_DEFAULTS = new Map<FamilyMetadata, SnesConsoleDefaults>([
  [GENERIC_FAMILY, GENERIC_DEFAULTS],
  [XBOX_FAMILY, { buttons: STANDARD_BUTTONS }],
  [PLAYSTATION_FAMILY, { buttons: STANDARD_BUTTONS }],
  [NINTENDO_FAMILY, { buttons: { ...STANDARD_BUTTONS, SOUTH: 'B', EAST: 'A', WEST: 'Y', NORTH: 'X' } }],
  [
    GAMECUBE_FAMILY,
    {
      buttons: {
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
    },
  ],
]);

export { GENERIC_DEFAULTS, SNES_CONSOLE_DEFAULTS };
