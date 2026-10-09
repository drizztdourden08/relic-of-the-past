/* @layer shared-asset-extraction @kind logic */
import { SLOT_SIDE } from './fixed-row-tiles.constants';
import type { ImageBuffer } from '../../graphics/png-writer';

const isSlotSized = (picture: ImageBuffer): boolean =>
  picture.width === SLOT_SIDE && picture.height === SLOT_SIDE;

export { isSlotSized };
