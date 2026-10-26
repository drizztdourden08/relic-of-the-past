/* @layer website-site @kind data */
import type { Screenshot, ShotId } from './screenshot.type';

const SHOTS: Readonly<Record<ShotId, Screenshot>> = {
  'sh-01': {
    id: 'sh-01',
    src: 'media/shots/sh-01.webp',
    width: 1024,
    height: 896,
    alt: 'Link outside the Sanctuary in A Link to the Past, running as a native desktop app',
  },
  'sh-02': {
    id: 'sh-02',
    src: 'media/shots/sh-04.webp',
    width: 1280,
    height: 720,
    alt: 'Hyrule Castle in widescreen, drawn at high resolution',
  },
  'sh-03': {
    id: 'sh-03',
    src: 'media/shots/sh-03.webp',
    width: 768,
    height: 640,
    alt: 'Castle soldiers in the rain with many sprites on one scan line and no flicker',
  },
  'sh-04': {
    id: 'sh-04',
    src: 'media/shots/sh-04.webp',
    width: 1280,
    height: 720,
    alt: 'The front of Hyrule Castle in a 16:9 widescreen view',
  },
  'sh-05': {
    id: 'sh-05',
    src: 'media/shots/sh-05.webp',
    width: 768,
    height: 672,
    alt: 'The same spot at Hyrule Castle in the original 4:3 view',
  },
  'sh-06': {
    id: 'sh-06',
    src: 'media/shots/sh-06.webp',
    width: 1280,
    height: 720,
    alt: "Link's house in widescreen with the space past the walls darkened",
  },
  'sh-07': {
    id: 'sh-07',
    src: 'media/shots/sh-07.webp',
    width: 1280,
    height: 312,
    alt: "Uncle's first message in the enhanced message box",
  },
  'sh-08': {
    id: 'sh-08',
    src: 'media/shots/sh-08.webp',
    width: 1280,
    height: 720,
    alt: 'The controls page with a controller mapped button by button',
  },
  'sh-09': {
    id: 'sh-09',
    src: 'media/shots/sh-09.webp',
    width: 1280,
    height: 720,
    alt: 'The home screen with a list of quick saves and auto-saves, each with a screenshot',
  },
  'sh-10': {
    id: 'sh-10',
    src: 'media/shots/sh-10.webp',
    width: 1280,
    height: 720,
    alt: 'The gameplay settings with the movement and items switches',
  },
  'sh-11': {
    id: 'sh-11',
    src: 'media/shots/sh-11.webp',
    width: 1280,
    height: 720,
    alt: "The randomizer page with a seed's options",
  },
  'sh-12': {
    id: 'sh-12',
    src: 'media/shots/sh-13.webp',
    width: 1280,
    height: 720,
    alt: 'The jail cell with the checks tracker docked beside the game',
  },
  'sh-13': {
    id: 'sh-13',
    src: 'media/shots/sh-13.webp',
    width: 1280,
    height: 720,
    alt: 'The jail cell with the checks tracker docked beside the game',
  },
  'sh-14': {
    id: 'sh-14',
    src: 'media/shots/sh-15.webp',
    width: 1280,
    height: 720,
    alt: 'The Player Sprite Studio gallery of outfits',
  },
  'sh-15': {
    id: 'sh-15',
    src: 'media/shots/sh-15.webp',
    width: 1280,
    height: 720,
    alt: 'The Player Sprite Studio gallery of outfits',
  },
  'sh-16': {
    id: 'sh-16',
    src: 'media/shots/sh-16.webp',
    width: 1280,
    height: 720,
    alt: 'The Hookshop store with community packs to browse and install',
  },
};

export { SHOTS };
