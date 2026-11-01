/* @layer website-site @kind logic */
import { GRADIENT_BAND_ROWS, GRADIENT_DITHER_ROWS, GRADIENT_RAMP } from '../PixelGradientBg.constants';
import type { DitherLine, GradientBand, GradientLayout } from '../PixelGradientBg.type';

const ditherLines = (y: number, stroke: string): DitherLine[] =>
  Array.from({ length: GRADIENT_DITHER_ROWS }, (_, row) => ({ y: y + row + 0.5, stroke, offset: (y + row) % 2 }));

const layoutGradient = (): GradientLayout => {
  const bands: GradientBand[] = [];
  const dither: DitherLine[] = [];
  let y = 0;
  GRADIENT_RAMP.forEach((fill, index) => {
    const rows = GRADIENT_BAND_ROWS[index] ?? 0;
    const next = GRADIENT_RAMP[index + 1];
    bands.push({ y, height: rows + (next ? GRADIENT_DITHER_ROWS : 0), fill });
    y += rows;
    if (!next) return;
    dither.push(...ditherLines(y, next));
    y += GRADIENT_DITHER_ROWS;
  });
  return { bands, dither, height: y };
};

export { layoutGradient };
