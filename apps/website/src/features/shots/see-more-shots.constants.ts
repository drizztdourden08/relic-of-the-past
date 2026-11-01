/* @layer website-site @kind data */
import type { Screenshot } from '../screenshot.type';

const SEE_MORE_SHOTS = {
  'edge-off': {
    id: 'edge-off',
    src: 'media/shots/edge-effect-off.webp',
    width: 1278,
    height: 720,
    alt: 'A ledge in widescreen with black bars at the edge of the world',
  },
  'edge-on': {
    id: 'edge-on',
    src: 'media/shots/edge-effect-on.webp',
    width: 1278,
    height: 720,
    alt: 'The same ledge with Edge Effect filling the border with a soft mirror of the scene',
  },
  'hide-sanctuary-off': {
    id: 'hide-sanctuary-off',
    src: 'media/shots/hide-sanctuary-off.webp',
    width: 1194,
    height: 672,
    alt: 'The Sanctuary interior in widescreen with a dark green void beside the walls',
  },
  'hide-sanctuary-on': {
    id: 'hide-sanctuary-on',
    src: 'media/shots/hide-sanctuary-on.webp',
    width: 1194,
    height: 672,
    alt: 'The Sanctuary interior with Hide Space Beyond Walls: the space past the walls is black',
  },
  'hide-house-off': {
    id: 'hide-house-off',
    src: 'media/shots/hide-house-off.webp',
    width: 1194,
    height: 672,
    alt: "Link's house in widescreen with a brown void beside the walls",
  },
  'hide-house-on': {
    id: 'hide-house-on',
    src: 'media/shots/hide-house-on.webp',
    width: 1194,
    height: 672,
    alt: "Link's house with Hide Space Beyond Walls: the space past the walls is black",
  },
  'hud-wide-off': {
    id: 'hud-wide-off',
    src: 'media/shots/hud-wide-off.webp',
    width: 1280,
    height: 720,
    alt: 'A widescreen view with the original HUD',
  },
  'hud-wide-on': {
    id: 'hud-wide-on',
    src: 'media/shots/hud-wide-on.webp',
    width: 1280,
    height: 720,
    alt: 'The same widescreen view with the HUD drawn and supported for the wide view',
  },
  'camera-transition-poster': {
    id: 'camera-transition-poster',
    src: 'media/shots/camera-transition-poster.webp',
    width: 1566,
    height: 672,
    alt: "Link walking north from his uncle's house, the camera moving into the next area",
  },
} as const satisfies Record<string, Screenshot>;

export { SEE_MORE_SHOTS };
