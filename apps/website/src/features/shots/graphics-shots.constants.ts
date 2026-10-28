/* @layer website-site @kind data */
import type { Screenshot } from '../screenshot.type';

const GRAPHICS_SHOTS = {
  'rupees-off': {
    id: 'gfx-rupees-off',
    src: 'media/shots/gfx-rupees-off.webp',
    width: 1152,
    height: 648,
    alt: 'The original rupees: green, blue and red gems, and a green gem with the amount written beside it for 50, 100 and 300',
  },
  'rupees-on': {
    id: 'gfx-rupees-on',
    src: 'media/shots/gfx-rupees-on.webp',
    width: 1152,
    height: 648,
    alt: 'The new rupees: green, blue, red, violet for 50, silver for 100 and gold for 300',
  },
  'sheen-off': {
    id: 'gfx-sheen-off',
    src: 'media/shots/gfx-sheen-off.webp',
    width: 1152,
    height: 648,
    alt: 'Items on the ground with no sheen',
  },
  'sheen-on': {
    id: 'gfx-sheen-on',
    src: 'media/shots/gfx-sheen-on.webp',
    width: 1152,
    height: 648,
    alt: 'The same items with the sheen passing over them',
  },
  'bunny-map-off': {
    id: 'gfx-bunny-map-off',
    src: 'media/shots/gfx-bunny-map-off.webp',
    width: 512,
    height: 512,
    alt: 'Link as a bunny after the map, with the wrong colours on his face',
  },
  'bunny-map-on': {
    id: 'gfx-bunny-map-on',
    src: 'media/shots/gfx-bunny-map-on.webp',
    width: 512,
    height: 512,
    alt: 'Link as a bunny after the map, in his proper colours',
  },
} as const satisfies Record<string, Screenshot>;

export { GRAPHICS_SHOTS };
