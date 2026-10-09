/* @layer renderer-lib @kind logic */
import { MSU1_HEADER_BYTES } from '@shared/types/msu1-format';

const hasMsu1Magic = (bytes: Uint8Array): boolean =>
  bytes.byteLength >= MSU1_HEADER_BYTES &&
  bytes[0] === 0x4d && bytes[1] === 0x53 && bytes[2] === 0x55 && bytes[3] === 0x31;

export { hasMsu1Magic };
