/* @layer renderer-lib @kind logic */
import { OPUZ_HEADER_BYTES } from './parse-opuz.constants';

const hasOpuzMagic = (bytes: Uint8Array): boolean =>
  bytes.byteLength >= OPUZ_HEADER_BYTES &&
  bytes[0] === 0x4f && bytes[1] === 0x50 && bytes[2] === 0x55 && bytes[3] === 0x5a;

export { hasOpuzMagic };
