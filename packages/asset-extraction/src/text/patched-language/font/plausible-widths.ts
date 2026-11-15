/* @layer shared-asset-extraction @kind logic */
import { LETTER_PROBE, LETTER_RATIO, MAX_GLYPH_WIDTH } from './font.constants';

const plausibleWidths = (widths: Uint8Array): boolean => {
  if (widths.some((width) => width > MAX_GLYPH_WIDTH)) return false;
  const letters = widths.subarray(0, LETTER_PROBE);
  const drawn = letters.filter((width) => width >= 1).length;
  return letters.length > 0 && drawn / letters.length >= LETTER_RATIO;
};

export { plausibleWidths };
