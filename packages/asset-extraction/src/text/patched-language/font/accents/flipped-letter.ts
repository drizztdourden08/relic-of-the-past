/* @layer shared-asset-extraction @kind logic */
import { glyphPixelGrid } from '../glyph-pixel-grid';
import { FLIPS, MARK_TOLERANCE } from './accents.constants';
import type { ComposedLetter, FlipInput, PixelGrid, Shape } from './accents.type';
import { cropShape } from './crop-shape';
import { shapeDistance } from './shape-distance';

const turnings = (grid: PixelGrid): Shape[] => {
  const upsideDown = [...grid].reverse();
  const turned = upsideDown.map((row) => [...row].reverse());
  return [upsideDown, turned].flatMap((pixels) => {
    const shape = cropShape(pixels);
    return shape ? [shape] : [];
  });
};

const flippedLetter = (input: FlipInput): ComposedLetter | null => {
  const target = cropShape(glyphPixelGrid(input.tiles, input.glyph));
  if (target === null) return null;
  for (const flip of FLIPS) {
    const home = input.alphabet.indexOf(flip.from);
    if (home < 0 || home === input.glyph) continue;
    const near = turnings(glyphPixelGrid(input.tiles, home)).some((shape) => shapeDistance(shape, target) <= MARK_TOLERANCE);
    if (near) return { token: flip.token, how: 'flipped', detail: `${flip.from} upside down` };
  }
  return null;
};

export { flippedLetter };
