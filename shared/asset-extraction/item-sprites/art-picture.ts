/* @layer shared-asset-extraction @kind logic */
import { parsePixelArtSvg } from '../graphics/svg-pixel-art';
import { artSvgOf } from './art/art-svg-of';
import type { ImageBuffer } from '../graphics/png-writer';

const artImage = (name: string): ImageBuffer => parsePixelArtSvg(artSvgOf(name));

export { artImage };
