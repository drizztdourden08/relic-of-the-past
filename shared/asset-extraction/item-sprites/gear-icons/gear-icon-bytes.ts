/* @layer shared-asset-extraction @kind logic */
import { encodeIcon, quantizeIcon, shiftIndicesLeft } from '../fixed-row-tiles';
import { kTab1 } from '../receipt-tables';
import { NARROW_INSET } from './gear-icons.constants';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { RGBA } from '../../graphics/palette';

const isNarrow = (receiptId: number): boolean => kTab1[receiptId] === 0;

const gearIconBytes = (picture: ImageBuffer, receiptId: number, row: readonly RGBA[]): Uint8Array => {
  const { indices } = quantizeIcon(picture, row);
  return encodeIcon(isNarrow(receiptId) ? shiftIndicesLeft(indices, NARROW_INSET) : indices);
};

export { gearIconBytes };
