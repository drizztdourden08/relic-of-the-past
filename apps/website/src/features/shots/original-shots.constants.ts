/* @layer website-site @kind data */
import type { Screenshot } from '../screenshot.type';

const ORIGINAL_SHOTS = {
  'v-01': {
    id: 'v-01',
    src: 'media/shots/v-01.webp',
    width: 1024,
    height: 896,
    alt: 'Link outside the Sanctuary in A Link to the Past, running as a native desktop app',
  },
  'v-02': {
    id: 'v-02',
    pending: true,
    src: 'media/shots/v-02.webp',
    width: 540,
    height: 1170,
    alt: 'The same game running on an Android phone',
  },
  'v-05-lens': {
    id: 'v-05-lens',
    src: 'media/shots/v-05-lens.webp',
    width: 384,
    height: 384,
    alt: 'Death Mountain on the world map in the original blocky Mode 7, magnified',
  },
  'v-06': {
    id: 'v-06',
    src: 'media/shots/v-06.webp',
    width: 1178,
    height: 664,
    alt: 'The world map in Enhanced Mode 7, sharp at full resolution',
  },
  'v-06-lens': {
    id: 'v-06-lens',
    src: 'media/shots/v-06-lens.webp',
    width: 384,
    height: 384,
    alt: 'Death Mountain on the world map in Enhanced Mode 7, magnified',
  },
} as const satisfies Record<string, Screenshot>;

export { ORIGINAL_SHOTS };
