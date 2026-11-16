/* @layer shared-game @kind logic */
import type { MaskBox } from '../mask/mask.type';

const middle = (box: MaskBox): number => box.top + Math.floor((box.bottom - box.top) / 2);

export { middle };
