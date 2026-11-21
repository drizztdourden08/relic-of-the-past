/* @layer shared-game @kind logic */
import { maskBox } from './mask-box';
import { EDGE_PX, MAX_WIDTH } from './mask.constants';

const maskWidth = (mask: Uint8Array, least: number): number => {
  const box = maskBox(mask);
  const drawn = box === undefined ? 0 : box.right + EDGE_PX;
  return Math.max(1, Math.min(MAX_WIDTH, Math.max(least, drawn)));
};

export { maskWidth };
