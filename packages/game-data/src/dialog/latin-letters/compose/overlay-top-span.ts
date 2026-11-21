/* @layer shared-game @kind logic */
import type { MaskBox } from '../mask/mask.type';
import { rowExtent } from '../mask/row-extent';

const topSpan = (mask: Uint8Array, box: MaskBox) => rowExtent(mask, box.top, box.top + 2);

export { topSpan };
