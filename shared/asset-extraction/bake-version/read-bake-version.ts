/* @layer shared-asset-extraction @kind logic */
import { HEADER_MIN_BYTES, STAMP_MAGIC, STAMP_OFFSET, VERSION_OFFSET } from './bake-version.constants';

const readBakeVersion = (dat: Uint8Array): number => {
  if (dat.length < HEADER_MIN_BYTES) return 0;
  for (let i = 0; i < STAMP_MAGIC.length; i++) {
    if (dat[STAMP_OFFSET + i] !== STAMP_MAGIC.charCodeAt(i)) return 0;
  }
  const view = new DataView(dat.buffer, dat.byteOffset, dat.byteLength);
  return view.getUint32(VERSION_OFFSET, true);
};

export { readBakeVersion };
