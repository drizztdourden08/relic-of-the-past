/* @layer website-site @kind data */
import type { Feature } from '../feature.type';
import { RATIO_SHOTS as RATIO } from '../shots/ratio-shots.constants';
import { SEE_MORE_SHOTS as SHOTS } from '../shots/see-more-shots.constants';

const SEE_MORE_VIEW_FEATURES: readonly Feature[] = [
  {
    id: 'widescreen',
    label: 'Aspect ratio',
    short: 'Widescreen',
    title: 'Wide screens and tall screens',
    promise: ['More of Hyrule, not a stretched picture.', 'Ultrawide monitors and tall phones alike.'],
    body: 'The game draws more of the world around you, wide or tall. Monitors and phones both fit.',
    settings: ['Aspect ratio', 'Tall view', 'Ultrawide'],
    caption: 'Ten shapes of the same spot.',
    layout: 'wide',
    visual: {
      kind: 'ratios',
      frames: [
        { label: '4:3', shot: RATIO['ratio-4-3'] },
        { label: '3:2', shot: RATIO['ratio-3-2'] },
        { label: '16:10', shot: RATIO['ratio-16-10'] },
        { label: '16:9', shot: RATIO['ratio-16-9'] },
        { label: '21:9', shot: RATIO['ratio-21-9'] },
        { label: '32:9', shot: RATIO['ratio-32-9'] },
        { label: '4:5', shot: RATIO['ratio-4-5'] },
        { label: '3:4', shot: RATIO['ratio-3-4'] },
        { label: '9:16', shot: RATIO['ratio-9-16'] },
        { label: '8:15', shot: RATIO['ratio-8-15'] },
      ],
    },
  },
  {
    id: 'hud',
    label: 'HUD',
    short: 'HUD',
    title: 'A HUD made for the wide view',
    promise: ['The original HUD, in widescreen.', 'It fits at any width.'],
    body: 'Hearts, magic and items keep their original look and fit the wide view. A modern HUD is coming.',
    settings: ['HUD', 'Hearts', 'Magic meter'],
    caption: 'The original HUD, then the widescreen one.',
    layout: 'split',
    visual: {
      kind: 'compare',
      before: SHOTS['hud-wide-off'],
      after: SHOTS['hud-wide-on'],
      labels: ['Original HUD', 'Widescreen HUD'],
      axis: 'x',
    },
  },
  {
    id: 'edge-effect',
    label: 'Edge Effect',
    short: 'Edge Effect',
    title: 'No black bars at the edge',
    promise: ['The edge of the map, filled in.', 'A soft mirror instead of black.'],
    body: 'Past the edge of the map, Edge Effect draws a soft mirror of the scene instead of black bars.',
    settings: ['Edge Effect'],
    caption: 'The black edge, then Edge Effect.',
    layout: 'split',
    visual: {
      kind: 'compare',
      before: SHOTS['edge-off'],
      after: SHOTS['edge-on'],
      labels: ['Black edge', 'Edge Effect'],
      axis: 'x',
    },
  },
  {
    id: 'hide-space',
    label: 'Hide Space Beyond Walls',
    short: 'Beyond walls',
    title: 'No void past the walls',
    promise: ['Houses and caves stay closed.', 'Black beyond the walls.'],
    body: 'In a wide view you can see past the walls of a room. This turns that space black.',
    settings: ['Beyond walls'],
    caption: 'The space past the walls, off and on.',
    layout: 'split',
    visual: {
      kind: 'picker',
      labels: ['Off', 'On'],
      axis: 'x',
      focus: 'center',
      options: [
        { id: 'sanctuary', name: 'Sanctuary', before: SHOTS['hide-sanctuary-off'], after: SHOTS['hide-sanctuary-on'] },
        { id: 'house', name: "Link's house", before: SHOTS['hide-house-off'], after: SHOTS['hide-house-on'] },
      ],
    },
  },
  {
    id: 'smooth-transitions',
    label: 'Smooth transitions',
    short: 'Smooth transitions',
    title: 'Smooth area transitions',
    promise: ['Walk from one area to the next, smoothly.', 'No cuts, no black bars.'],
    body: 'The camera glides across the seam between two areas instead of cutting at the screen edge. You can also lock it inside the world, so black bars never show.',
    settings: ['Camera lock', 'Transitions'],
    caption: "Link walking north from his uncle's house.",
    layout: 'split',
    visual: {
      kind: 'video',
      video: { src: 'media/shots/camera-transition.mp4', poster: SHOTS['camera-transition-poster'] },
    },
  },
];

export { SEE_MORE_VIEW_FEATURES };
