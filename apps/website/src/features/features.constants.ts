/* @layer website-site @kind data */
import type { Feature } from './feature.type';

const FEATURES: Feature[] = [
  {
    id: 'native',
    title: 'The classic, running natively',
    body: 'Built on the snesrev zelda3 decompilation: the original game logic, reverse-engineered into C and compiled into a true desktop app. Pixel-perfect, instant, no emulator required.',
    media: 'media/feature-1.png',
    mediaRatio: '1450 / 901',
    mediaAlt: 'A Link to the Past running in Relic of the Past, with HUD and FPS counter',
  },
  {
    id: 'modern-shell',
    title: 'A modern shell around a timeless world',
    body: 'Profiles, save states, MSU-1 audio, and full controller support with per-button remapping: a clean interface that stays out of the way until you need it.',
    media: 'media/feature-2.png',
    mediaRatio: '869 / 531',
    mediaAlt: 'Button mappings panel remapping a Nintendo Switch Pro Controller',
  },
  {
    id: 'tracker',
    title: 'Track every check',
    body: 'A live checks tracker layered onto the game: every chest, key, and heart piece, marked done, available, or blocked, searchable by region as you play.',
    media: 'media/feature-3.png',
    mediaRatio: '1530 / 1041',
    mediaAlt: 'The checks tracker widget docked beside the game, listing Hyrule Castle checks',
  },
];

export { FEATURES };
