/* @layer shared-asset-extraction @kind logic */
import { encodeIcon, quantizeIcon } from '../fixed-row-tiles';
import { stripFrame } from './strip-frame';
import {
  CURRENCY_SYMBOL_FILES, CURRENCY_SYMBOL_PALETTE_ROW, STRIP_BYTES, STRIP_HEIGHT, STRIP_WIDTH,
} from './currency-symbols.constants';
import type { RGBA } from '../../graphics/palette';
import type { ImageBuffer } from '../../graphics/png-writer';

const isStripSized = (picture: ImageBuffer): boolean =>
  picture.width <= STRIP_WIDTH && picture.height <= STRIP_HEIGHT;

const symbolBytes = (picture: ImageBuffer, row: readonly RGBA[]): Uint8Array =>
  encodeIcon(quantizeIcon(stripFrame(picture), row).indices).subarray(0, STRIP_BYTES);

const buildCurrencySymbolsFile = (
  pictures: ReadonlyMap<string, ImageBuffer>, paletteRows: readonly (readonly RGBA[])[],
): Uint8Array | null => {
  const out = new Uint8Array(STRIP_BYTES * CURRENCY_SYMBOL_FILES.length);
  const row = paletteRows[CURRENCY_SYMBOL_PALETTE_ROW];
  for (const [id, file] of CURRENCY_SYMBOL_FILES.entries()) {
    const picture = pictures.get(file);
    if (!picture || !isStripSized(picture)) return null;
    out.set(symbolBytes(picture, row), id * STRIP_BYTES);
  }
  return out;
};

export { buildCurrencySymbolsFile };
