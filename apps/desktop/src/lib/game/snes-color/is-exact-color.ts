/* @layer renderer-lib @kind logic */
import { bgr555ToHex } from './bgr555-to-hex';
import { hexToBgr555 } from './hex-to-bgr555';

const isExactColor = (hex: string): boolean => {
  const normalized = `#${(parseInt(hex.replace(/^#/, ''), 16) || 0).toString(16).padStart(6, '0')}`;
  return bgr555ToHex(hexToBgr555(normalized)) === normalized;
};

export { isExactColor };
