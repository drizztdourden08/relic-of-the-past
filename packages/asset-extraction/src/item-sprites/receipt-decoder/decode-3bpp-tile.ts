/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { decode3bppTile as decodeIndices } from '../../graphics/bitplane-decoder';
import { paintIndexedTile } from '../../graphics/paint-indexed-tile';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { RGBA } from '../../graphics/palette';

const decode3bppTile = (raw: Buffer, offset: number, palette: RGBA[], high: boolean): ImageBuffer =>
  paintIndexedTile(decodeIndices(raw, offset), (px) => itemAt(palette, high ? px + 8 : px, 'Receipt palette colour'));

export { decode3bppTile };
