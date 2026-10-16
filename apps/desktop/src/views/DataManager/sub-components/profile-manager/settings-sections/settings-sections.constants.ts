/* @layer renderer-components @kind constants */
import { DISPLAY_SECTION, GRAPHICS_SECTION, HUD_SECTION } from './picture-sections.constants';
import { DIALOG_SECTION, GAMEPLAY_SECTION, GENERAL_SECTION, SAVING_SECTION } from './play-sections.constants';
import { AUDIO_SECTION, CONTROLS_SECTION, MSU_SECTION } from './sound-sections.constants';
import type { SettingsSection } from './settings-sections.type';

const SETTINGS_SECTIONS: SettingsSection[] = [
  GENERAL_SECTION,
  SAVING_SECTION,
  DISPLAY_SECTION,
  GRAPHICS_SECTION,
  HUD_SECTION,
  AUDIO_SECTION,
  MSU_SECTION,
  GAMEPLAY_SECTION,
  DIALOG_SECTION,
  CONTROLS_SECTION,
];

export { SETTINGS_SECTIONS };
