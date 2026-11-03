/* @layer shared-asset-extraction @kind logic */
import { decode3bppTile } from '../../graphics/bitplane-decoder';
import { TILE_BYTES } from './bg-tile-decoder.constants';

const decodeBgTile = (sheet: Buffer, index: number): Uint8Array => decode3bppTile(sheet, index * TILE_BYTES);

export { decodeBgTile };
