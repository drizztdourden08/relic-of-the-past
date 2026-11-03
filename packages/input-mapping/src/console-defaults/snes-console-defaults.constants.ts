/* @layer shared-input @kind constants */
import { GAMECUBE_FAMILY, GENERIC_FAMILY, NINTENDO_FAMILY, PLAYSTATION_FAMILY, XBOX_FAMILY } from '@drizztdourden08/brock-input';
import type { FamilyMetadata } from '@drizztdourden08/brock-input';
import type { SdlButtonName } from '@rotp/game-data';
import type { SnesConsoleDefaults } from './snes-console-defaults.type';

const DPAD_BUTTONS = {
  DPAD_UP: 'Up',
  DPAD_DOWN: 'Down',
  DPAD_LEFT: 'Left',
  DPAD_RIGHT: 'Right',
} as const;

const BUTTONS_WITHOUT_DPAD = {
  SOUTH: 'A',
  EAST: 'B',
  WEST: 'X',
  NORTH: 'Y',
  LEFT_SHOULDER: 'L',
  RIGHT_SHOULDER: 'R',
  BACK: 'Select',
  START: 'Start',
} as const;

const STANDARD_BUTTONS = { ...BUTTONS_WITHOUT_DPAD, ...DPAD_BUTTONS } as const;

const LEFT_STICK_AXES = {
  LEFT_X: { '-': 'Left', '+': 'Right' },
  LEFT_Y: { '-': 'Up', '+': 'Down' },
} as const;

const GENERIC_DEFAULTS: SnesConsoleDefaults = {
  buttons: STANDARD_BUTTONS,
  axes: LEFT_STICK_AXES,
};

const XBOX_DEFAULTS: SnesConsoleDefaults = {
  buttons: BUTTONS_WITHOUT_DPAD,
  axes: LEFT_STICK_AXES,
  unbound: Object.keys(DPAD_BUTTONS) as SdlButtonName[],
};

const SNES_CONSOLE_DEFAULTS = new Map<FamilyMetadata, SnesConsoleDefaults>([
  [GENERIC_FAMILY, GENERIC_DEFAULTS],
  [XBOX_FAMILY, XBOX_DEFAULTS],
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
