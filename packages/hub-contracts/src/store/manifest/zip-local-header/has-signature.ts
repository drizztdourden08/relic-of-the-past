/* @layer shared-store @kind logic */
import { SIGNATURE } from './zip-local-header.constants';

const hasSignature = (head: Uint8Array): boolean => SIGNATURE.every((byte, i) => head[i] === byte);

export { hasSignature };
