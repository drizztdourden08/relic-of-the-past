/* @layer shared-asset-extraction @kind logic */
import { packArrays } from '../../asset-builder/pack-arrays';

const buildFontPacked = (fontData: Buffer, fontWidth: Buffer): Buffer => packArrays([fontData, fontWidth]);

export { buildFontPacked };
