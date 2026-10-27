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
  'v-18a': {
    id: 'v-18a',
    src: 'media/shots/v-18a.webp',
    width: 854,
    height: 119,
    alt: 'A save card with its screenshot and name',
  },
  'v-18b': {
    id: 'v-18b',
    src: 'media/shots/v-18b.webp',
    width: 854,
    height: 119,
    alt: 'Another save card with its screenshot and name',
  },
} as const satisfies Record<string, Screenshot>;

export { YOUR_WAY_SHOTS };
