/* @layer shared-storage @kind logic */
import { HEX_DIGITS_PER_BYTE, HEX_RADIX } from './hex-bytes.constants';

const hexOf = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(HEX_RADIX).padStart(HEX_DIGITS_PER_BYTE, '0')).join('');

export { hexOf };
