/* @layer renderer-hooks @kind logic */
import type { RandomizerOptionChoices } from '../randomizer-choices';
import type { DarkRoomSetting } from '@shared/randomizer/world/dark-rooms/dark-room.type';

const darkRoomSettingOfChoices = (choices: RandomizerOptionChoices): DarkRoomSetting => ({
  requireLight: choices.darkRoomLightRequired,
  lights: {
    lamp: choices.darkRoomLightLamp,
    fireRod: choices.darkRoomLightFireRod,
    bombos: choices.darkRoomLightBombos,
    redCane: choices.darkRoomLightRedCane,
  },
});

export { darkRoomSettingOfChoices };
