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
      body: 'The game draws the extra world around you at any shape: wide for monitors up to 32:9, and tall for portrait screens and phones. You choose whether enemies out there keep moving.',
      settings: ['Aspect ratio', 'Tall view', 'Ultrawide'],
      caption: 'Ten views of the same spot, centred on the same point. The wide ones reach sideways, the tall ones up and down.',
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
      promise: ['The original HUD, in widescreen.', 'Drawn and supported at any width.'],
      body: 'Hearts, magic, items and counters keep the look of the original and are drawn and supported in a wide view. Hover to compare it with the original HUD. A modern HUD, with full in-game button rebinding like a modern Zelda, is coming.',
      settings: ['HUD', 'Hearts', 'Magic meter'],
      caption: 'The original HUD, then the widescreen HUD. The divider sweeps by itself until the cursor takes it.',
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
      promise: ['The edge of the map, filled in.', 'A soft mirror of the scene instead of black.'],
      body: "Edge Effect fills the space past the map's edge with a soft mirror of the scene. Move the cursor over the picture to take the divider and compare it with the black edge.",
      settings: ['Edge Effect'],
      caption: 'Edge Effect off, then on. The divider sweeps by itself until the cursor takes it.',
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
      promise: ['Houses, caves and the Sanctuary stay closed.', 'Black beyond the walls, as it should be.'],
      body: 'In a wide or tall view the game shows what lies past the walls of a room, a void tinted by the room. Hide Space Beyond Walls turns it black. Pick a room under the picture, and hover to compare.',
      settings: ['Beyond walls'],
      caption: 'The space past the walls, off and on, in the Sanctuary and in a house.',
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
      promise: ['Cross from one area to the next, smoothly.', 'At any resolution, with no black bars.'],
      body: 'Smooth transitions pan across the seam between two areas at any resolution instead of cutting at the edge of the screen. Lock camera to the wide view is the alternative to Edge Effect: the camera always stays inside the drawn world, so black bars never show.',
      settings: ['Camera lock', 'Transitions'],
      caption: 'The camera crossing from one area to the next with the lock and smooth transitions on.',
      layout: 'split',
      visual: {
        kind: 'video',
        video: { src: 'media/shots/camera-transition.mp4', poster: SHOTS['camera-transition-poster'] },
      },
    },
];

export { SEE_MORE_VIEW_FEATURES };
