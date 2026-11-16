/* @layer shared-game @kind logic */
import type { MaskBox } from '../mask/mask.type';
import { rowExtent } from '../mask/row-extent';
import { middle } from './overlay-middle';

const midSpan = (mask: Uint8Array, box: MaskBox) => rowExtent(mask, middle(box), middle(box));

export { midSpan };
