/* @layer renderer-components @kind constants */
import type { Section } from '../../../compounds/SettingsLayout';
import { ENHANCEMENTS_SECTION, RENDERING_SECTION } from './SettingsView.constants';

const APPEARANCE_SECTION: Section = {
  id: 'appearance',
  title: 'Appearance',
  items: [{ key: 'linkSprite', label: 'Player Sprite', description: 'Choose a custom player sprite from your library.', keywords: 'player sprite character appearance custom zspr' }],
};

const GRAPHICS_SECTIONS: Section[] = [RENDERING_SECTION, ENHANCEMENTS_SECTION, APPEARANCE_SECTION];

export { APPEARANCE_SECTION, GRAPHICS_SECTIONS };
