/* @layer renderer-hooks @kind logic */
/**
 * The dark-room pair of the creation form's choices, read and written as the
 * one setting the section edits. The five fields stay exactly where they were
 * on the choices object — this only gathers them, so the wiring through
 * randomizer-choices (and the snapshot it freezes) is untouched.
 *
 * Both directions are spelled out field by field rather than derived from the
 * key map, so a renamed field fails to compile here instead of resolving to
 * undefined at runtime and freezing a light the player never unticked.
 */
import type { RandomizerOptionChoices } from './randomizer-choices';
import type { DarkRoomSetting } from '@shared/randomizer/ap-world/dark-rooms/dark-room.type';

const darkRoomSettingOfChoices = (choices: RandomizerOptionChoices): DarkRoomSetting => ({
  requireLight: choices.darkRoomLightRequired,
  lights: {
    lamp: choices.darkRoomLightLamp,
    fireRod: choices.darkRoomLightFireRod,
    bombos: choices.darkRoomLightBombos,
    redCane: choices.darkRoomLightRedCane,
  },
});

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

export { darkRoomSettingOfChoices, withDarkRoomSetting };
