/* @layer shared-asset-extraction @kind logic */
/**
 * A 16x16 picture quantized to ONE fixed sprite palette row by how the colours look, for
 * pictures drawn with colours the row does not hold (the multiworld pool icons). The colour
 * choice is per picture (perceptual-match.ts): greys stay greys, hues go to the nearest hue,
 * and shades that would merge are kept apart where the row allows. Index 0 is transparent.
 */
import { toOklab } from '../graphics/oklab';
import { SLOT_SIDE } from './fixed-row-tiles';
import { colorKey, matchTones } from './perceptual-match';
import type { ImageBuffer } from '../graphics/png-writer';
import type { RGBA } from '../graphics/palette';
import type { QuantizedIcon } from './fixed-row-tiles';
import type { Tone } from './perceptual-match';

const pixelAt = (picture: ImageBuffer, i: number): RGBA => picture.getPixel(i % SLOT_SIDE, Math.floor(i / SLOT_SIDE));

/** The picture's distinct opaque colours with their pixel counts. */
const tonesOf = (picture: ImageBuffer): Tone[] => {
  const tones = new Map<number, Tone>();
  for (let i = 0; i < SLOT_SIDE * SLOT_SIDE; i++) {
    const pixel = pixelAt(picture, i);
    if (pixel[3] === 0) continue;
    const key = colorKey(pixel);
    const tone = tones.get(key) ?? { key, lab: toOklab(pixel), count: 0 };
    tone.count += 1;
    tones.set(key, tone);
  }
  return [...tones.values()];
};

const squaredDistance = (a: RGBA, b: RGBA): number =>
  (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

const quantizeIconPerceptual = (picture: ImageBuffer, row: readonly RGBA[]): QuantizedIcon => {
  const map = matchTones(tonesOf(picture), row);
  const indices = new Uint8Array(SLOT_SIDE * SLOT_SIDE);
  let error = 0;
  let opaque = 0;
  for (let i = 0; i < indices.length; i++) {
    const pixel = pixelAt(picture, i);
    const index = pixel[3] === 0 ? 0 : map.get(colorKey(pixel)) ?? 0;
    indices[i] = index;
    if (index === 0) continue;
    error += squaredDistance(pixel, row[index]);
    opaque += 1;
  }
  return { indices, error: opaque === 0 ? 0 : error / opaque };
};

export { quantizeIconPerceptual };
