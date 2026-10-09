/* @layer renderer-hooks @kind logic */
import type { RandomizerOptionChoices } from '../randomizer-choices';
import type { DarkRoomSetting } from '@shared/randomizer/world/dark-rooms/dark-room.type';

const withDarkRoomSetting = (
  choices: RandomizerOptionChoices, setting: DarkRoomSetting,
): RandomizerOptionChoices => ({
  ...choices,
  darkRoomLightRequired: setting.requireLight,
  darkRoomLightLamp: setting.lights.lamp,
  darkRoomLightFireRod: setting.lights.fireRod,
  darkRoomLightBombos: setting.lights.bombos,
  darkRoomLightRedCane: setting.lights.redCane,
});

export { withDarkRoomSetting };
