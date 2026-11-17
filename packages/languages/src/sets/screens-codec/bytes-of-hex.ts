/* @layer shared-storage @kind logic */
import { HEX_DIGITS_PER_BYTE, HEX_RADIX } from './hex-bytes.constants';

const bytesOfHex = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / HEX_DIGITS_PER_BYTE);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * HEX_DIGITS_PER_BYTE, (i + 1) * HEX_DIGITS_PER_BYTE), HEX_RADIX);
  return bytes;
};

export { bytesOfHex };
