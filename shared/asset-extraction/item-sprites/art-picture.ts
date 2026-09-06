/* @layer shared-asset-extraction @kind logic */
/**
 * One of our own drawings as a picture. The art library holds the SVG text
 * (art/art-library.ts, inlined at bundle time), and this parses it into the
 * same ImageBuffer a ROM-decoded sprite produces, so a drawing can stand
 * wherever an extracted picture stands: as a sprite in its own right, or as
 * the base of a composite.
 */
import { parsePixelArtSvg } from '../graphics/svg-pixel-art';
import { artSvgOf } from './art/art-library';
import type { ImageBuffer } from '../graphics/png-writer';

const artImage = (name: string): ImageBuffer => parsePixelArtSvg(artSvgOf(name));

export { artImage };
