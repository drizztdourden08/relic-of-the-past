/* @layer website-site @kind data */
import type { TitleVariant } from '../feature-visual.type';

const TITLE_VARIANTS: readonly [TitleVariant, ...TitleVariant[]] = [
  {
    id: 'fighter',
    name: 'Fighter',
    video: {
      src: 'media/shots/title-loop-fighter.mp4',
      poster: {
        id: 'title-poster-fighter',
        src: 'media/shots/title-poster-fighter.webp',
        width: 1280,
        height: 720,
        alt: 'The reimagined title screen with the redesigned fighter sword',
      },
    },
    thumb: {
      id: 'title-thumb-fighter',
      src: 'media/shots/title-poster-fighter.webp',
      width: 1280,
      height: 720,
      alt: 'The reimagined title screen with the redesigned fighter sword',
    },
  },
  {
    id: 'master',
    name: 'Master',
    video: {
      src: 'media/shots/title-loop-master.mp4',
      poster: {
        id: 'title-poster-master',
        src: 'media/shots/title-poster-master.webp',
        width: 1280,
        height: 720,
        alt: 'The reimagined title screen with the redesigned master sword',
      },
    },
    thumb: {
      id: 'title-thumb-master',
      src: 'media/shots/title-poster-master.webp',
      width: 1280,
      height: 720,
      alt: 'The reimagined title screen with the redesigned master sword',
    },
  },
  {
    id: 'tempered',
    name: 'Tempered',
    video: {
      src: 'media/shots/title-loop-tempered.mp4',
      poster: {
        id: 'title-poster-tempered',
        src: 'media/shots/title-poster-tempered.webp',
        width: 1280,
        height: 720,
        alt: 'The reimagined title screen with the redesigned tempered sword',
      },
    },
    thumb: {
      id: 'title-thumb-tempered',
      src: 'media/shots/title-poster-tempered.webp',
      width: 1280,
      height: 720,
      alt: 'The reimagined title screen with the redesigned tempered sword',
    },
  },
  {
    id: 'golden',
    name: 'Golden',
    video: {
      src: 'media/shots/title-loop-golden.mp4',
      poster: {
        id: 'title-poster-golden',
        src: 'media/shots/title-poster-golden.webp',
        width: 1280,
        height: 720,
        alt: 'The reimagined title screen with the redesigned golden sword',
      },
    },
    thumb: {
      id: 'title-thumb-golden',
      src: 'media/shots/title-poster-golden.webp',
      width: 1280,
      height: 720,
      alt: 'The reimagined title screen with the redesigned golden sword',
    },
  },
];

export { TITLE_VARIANTS };
