/* @layer website-site @kind data */
import type { Screenshot } from '../screenshot.type';

const SEE_MORE_SHOTS = {
  'v-07': {
    id: 'v-07',
    src: 'media/shots/v-07.webp',
    width: 1278,
    height: 720,
    alt: 'A path through the fields of Hyrule in a 16:9 widescreen view',
  },
  'v-08': {
    id: 'v-08',
    src: 'media/shots/v-08.webp',
    width: 768,
    height: 672,
    alt: 'The same spot in the original 4:3 view',
  },
  'v-09': {
    id: 'v-09',
    src: 'media/shots/v-09.webp',
    width: 1278,
    height: 720,
    alt: 'A ledge in widescreen with black bars at the edge of the world',
  },
  'v-10': {
    id: 'v-10',
    src: 'media/shots/v-10.webp',
    width: 1278,
    height: 720,
    alt: 'The same ledge with Edge Effect filling the border with a soft mirror of the scene',
  },
  'v-11': {
    id: 'v-11',
    src: 'media/shots/v-11.webp',
    width: 1278,
    height: 720,
    alt: "Link's house in widescreen with the space past the walls darkened",
  },
  'v-12': {
    id: 'v-12',
    src: 'media/shots/v-12.webp',
    width: 1278,
    height: 312,
    alt: "Uncle's message in the original message box",
  },
  'v-13': {
    id: 'v-13',
    src: 'media/shots/v-13.webp',
    width: 1278,
    height: 312,
    alt: "Uncle's first message in the enhanced message box",
  },
  'v-14a': {
    id: 'v-14a',
    src: 'media/shots/v-14a.webp',
    width: 588,
    height: 201,
    alt: 'A message box with a stone border',
  },
  'v-14b': {
    id: 'v-14b',
    src: 'media/shots/v-14b.webp',
    width: 588,
    height: 201,
    alt: 'A message box in night colours',
  },
  'v-14c': {
    id: 'v-14c',
    src: 'media/shots/v-14c.webp',
    width: 588,
    height: 201,
    alt: 'A message box with a parchment texture',
  },
  'v-15': {
    id: 'v-15',
    src: 'media/shots/v-15.webp',
    width: 1278,
    height: 486,
    alt: "The reimagined title screen, drawn from the game's own pictures",
  },
} as const satisfies Record<string, Screenshot>;

export { SEE_MORE_SHOTS };
