/* @layer shared-game @kind logic */
import type { MaskBox } from '../mask/mask.type';
import { rowExtent } from '../mask/row-extent';

const bottomSpan = (mask: Uint8Array, box: MaskBox) => rowExtent(mask, box.bottom - 2, box.bottom);

export { bottomSpan };
