/* @layer shared-asset-extraction @kind logic */
import { HEADER_BYTES, SIGNATURE } from './dat-reader.constants';

const hasSignature = (dat: Uint8Array): boolean => {
  if (dat.length < HEADER_BYTES) return false;
  for (let i = 0; i < SIGNATURE.length; i++) {
    if (dat[i] !== SIGNATURE.charCodeAt(i)) return false;
  }
  return true;
};

export { hasSignature };
