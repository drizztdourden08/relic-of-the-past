/* @layer shared-game @kind logic */
import { SWAP_STAIR_ATTRS } from './dual-layer.constants';

const swapStairAt = (rawAttrs: readonly number[][][], r: number, c: number): boolean =>
  rawAttrs.some((attrs) => {
    const attr = attrs[r]?.[c];
    return attr !== undefined && SWAP_STAIR_ATTRS.has(attr);
  });

export { swapStairAt };
