/* @layer website-site @kind data */
import type { Screenshot } from '../screenshot.type';

const TITLE_SWORD_SHOTS = [
  {
    id: 'title-sword-fighter',
    src: 'media/shots/title-sword-fighter.webp',
    width: 1816,
    height: 1024,
    alt: 'The reimagined title screen with the redesigned fighter sword',
  },
  {
    id: 'title-sword-master',
    src: 'media/shots/title-sword-master.webp',
    width: 1816,
    height: 1024,
    alt: 'The reimagined title screen with the redesigned master sword',
  },
  {
    id: 'title-sword-tempered',
    src: 'media/shots/title-sword-tempered.webp',
    width: 1816,
    height: 1024,
    alt: 'The reimagined title screen with the redesigned tempered sword',
  },
  {
    id: 'title-sword-golden',
    src: 'media/shots/title-sword-golden.webp',
    width: 1816,
    height: 1024,
    alt: 'The reimagined title screen with the redesigned golden sword',
  },
] as const satisfies readonly Screenshot[];

export { TITLE_SWORD_SHOTS };
