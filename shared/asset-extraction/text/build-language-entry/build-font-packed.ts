/* @layer shared-asset-extraction @kind logic */
import { packArrays } from '../../asset-builder';

const buildFontPacked = (fontData: Buffer, fontWidth: Buffer): Buffer => packArrays([fontData, fontWidth]);

export { buildFontPacked };
