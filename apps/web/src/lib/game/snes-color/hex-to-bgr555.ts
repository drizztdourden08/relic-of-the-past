/* @layer renderer-lib @kind logic */
import { quantizeChannel } from './quantize-channel';
import { BLUE_SHIFT, GREEN_SHIFT } from './snes-color.constants';

const hexToBgr555 = (hex: string): number => {
  const n = parseInt(hex.replace(/^#/, ''), 16) || 0;
  return quantizeChannel(n >> 16) | (quantizeChannel(n >> 8) << GREEN_SHIFT) | (quantizeChannel(n) << BLUE_SHIFT);
};

export { hexToBgr555 };
