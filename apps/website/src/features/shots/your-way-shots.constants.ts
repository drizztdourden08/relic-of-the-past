/* @layer website-site @kind data */
import type { Screenshot } from '../screenshot.type';

const YOUR_WAY_SHOTS = {
  'v-17': {
    id: 'v-17',
    src: 'media/shots/v-17.webp',
    width: 910,
    height: 555,
    alt: 'The auto-save settings: save on a timer, save on quit and the quick save shortcut',
  },
  'v-18': {
    id: 'v-18',
    src: 'media/shots/v-18.webp',
    width: 900,
    height: 560,
    alt: 'The home screen saves list, each save with a screenshot',
  },
  'ui-save-panel': {
    id: 'ui-save-panel',
    src: 'media/shots/ui-save-panel.webp',
    width: 1280,
    height: 728,
    alt: 'The save panel sliding down over the game, with the saves listed',
  },
} as const satisfies Record<string, Screenshot>;

export { YOUR_WAY_SHOTS };
