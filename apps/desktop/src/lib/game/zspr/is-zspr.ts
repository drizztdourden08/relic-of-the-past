/* @layer bridge-wasm @kind logic */
import { HEADER_BYTES, ZSPR_MAGIC } from './zspr.constants';

const isZspr = (b: Uint8Array): boolean =>
  b.length >= HEADER_BYTES && b[0] === ZSPR_MAGIC[0] && b[1] === ZSPR_MAGIC[1] && b[2] === ZSPR_MAGIC[2] && b[3] === ZSPR_MAGIC[3];

export { isZspr };
