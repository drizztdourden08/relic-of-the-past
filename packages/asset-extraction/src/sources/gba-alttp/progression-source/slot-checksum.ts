/* @layer shared-asset-extraction @kind logic */
import { saveChecksum } from './save-checksum';

const slotChecksum = (type: Uint8Array, data: Uint8Array): number => {
  const combined = (saveChecksum(type) + saveChecksum(data)) & 0xffff;
  return ((combined << 16) | ((~combined + 1) & 0xffff)) >>> 0;
};

export { slotChecksum };
