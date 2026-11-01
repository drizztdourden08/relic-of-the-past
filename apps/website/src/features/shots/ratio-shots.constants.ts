/* @layer website-site @kind data */
import type { Screenshot } from '../screenshot.type';

const RATIO_SHOTS = {
  'ratio-4-3': {
    id: 'ratio-4-3',
    src: 'media/shots/ratio-4-3.webp',
    width: 768,
    height: 672,
    alt: 'Hyrule Castle gate in the original 4:3 view',
  },
  'ratio-3-2': {
    id: 'ratio-3-2',
    src: 'media/shots/ratio-3-2.webp',
    width: 1008,
    height: 672,
    alt: 'The same spot in a 3:2 view',
  },
  'ratio-16-10': {
    id: 'ratio-16-10',
    src: 'media/shots/ratio-16-10.webp',
    width: 1074,
    height: 672,
    alt: 'The same spot in a 16:10 view',
  },
  'ratio-16-9': {
    id: 'ratio-16-9',
    src: 'media/shots/ratio-16-9.webp',
    width: 1194,
    height: 672,
    alt: 'The same spot in a 16:9 view',
  },
  'ratio-21-9': {
    id: 'ratio-21-9',
    src: 'media/shots/ratio-21-9.webp',
    width: 1566,
    height: 672,
    alt: 'The same spot in a 21:9 ultrawide view',
  },
  'ratio-32-9': {
    id: 'ratio-32-9',
    src: 'media/shots/ratio-32-9.webp',
    width: 2388,
    height: 672,
    alt: 'The same spot in a 32:9 super ultrawide view',
  },
  'ratio-4-5': {
    id: 'ratio-4-5',
    src: 'media/shots/ratio-4-5.webp',
    width: 768,
    height: 960,
    alt: 'The same spot in a tall 4:5 view',
  },
  'ratio-3-4': {
    id: 'ratio-3-4',
    src: 'media/shots/ratio-3-4.webp',
    width: 768,
    height: 1020,
    alt: 'The same spot in a tall 3:4 view',
  },
  'ratio-9-16': {
    id: 'ratio-9-16',
    src: 'media/shots/ratio-9-16.webp',
    width: 768,
    height: 1362,
    alt: 'The same spot in a tall 9:16 phone view',
  },
  'ratio-8-15': {
    id: 'ratio-8-15',
    src: 'media/shots/ratio-8-15.webp',
    width: 768,
    height: 1440,
    alt: 'The same spot in the tallest view the game allows, 8:15',
  },
} as const satisfies Record<string, Screenshot>;

export { RATIO_SHOTS };
