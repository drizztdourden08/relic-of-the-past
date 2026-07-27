/* @layer renderer-components @kind data */
/** Section/subsection config for the Graphics settings tab's Appearance group. */
import type { Section } from '../../../compounds/SettingsLayout';

const APPEARANCE_SECTION: Section = {
  id: 'appearance',
  title: 'Appearance',
  subsections: [
    {
      id: 'appearance-player',
      title: 'Player Sprite',
      items: [{ key: 'linkSprite', label: 'Player Sprite', description: 'Choose a custom player sprite from your library.', keywords: 'player sprite character appearance custom zspr' }],
    },
  ],
};

export { APPEARANCE_SECTION };
