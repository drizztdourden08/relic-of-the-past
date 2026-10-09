/* @layer shared-game @kind constants */
import { DARK_ROOM_LIGHT_FIELDS, DEFAULT_DARK_ROOM_SETTING } from './dark-room-lights.data';
import { DARK_ROOM_REQUIRED_KEY } from './dark-room-option-keys';
import { darkRoomLightSeed } from './dark-room-light-seed';
import { DARK_ROOM_TOGGLE } from './dark-room-toggle.constants';
import type { OptionSeed } from '../options.type';

const DARK_ROOM_OPTION_SEEDS: readonly OptionSeed[] = [
  {
    ...DARK_ROOM_TOGGLE,
    key: DARK_ROOM_REQUIRED_KEY,
    displayName: 'Dark rooms need a light',
    sourceDefault: DEFAULT_DARK_ROOM_SETTING.requireLight,
    baseline: DEFAULT_DARK_ROOM_SETTING.requireLight,
  },
  ...DARK_ROOM_LIGHT_FIELDS.map(darkRoomLightSeed),
];

export { DARK_ROOM_OPTION_SEEDS };
