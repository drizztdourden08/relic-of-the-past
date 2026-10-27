/* @layer website-site @kind data */
import type { Screenshot } from '../screenshot.type';

const MAKE_IT_YOURS_SHOTS = {
  'v-25': {
    id: 'v-25',
    pending: true,
    src: 'media/shots/v-25.webp',
    width: 910,
    height: 555,
    alt: 'MSU Studio with a music pack loaded, its tracks listed by name',
  },
  'v-26': {
    id: 'v-26',
    pending: true,
    src: 'media/shots/v-26.webp',
    width: 910,
    height: 555,
    alt: 'The Player Sprite Studio showing every pose in every direction',
  },
  'v-27': {
    id: 'v-27',
    pending: true,
    src: 'media/shots/v-27.webp',
    width: 910,
    height: 555,
    alt: 'The Language Studio editing the dialogue line by line',
  },
  'v-28': {
    id: 'v-28',
    pending: true,
    src: 'media/shots/v-28.webp',
    width: 1278,
    height: 312,
    alt: "Uncle's message in the game shown in French",
  },
  'v-29': {
    id: 'v-29',
    pending: true,
    src: 'media/shots/v-29.webp',
    width: 1278,
    height: 548,
    alt: 'The Hookshop store with community packs to browse and install',
  },
} as const satisfies Record<string, Screenshot>;

export { MAKE_IT_YOURS_SHOTS };
