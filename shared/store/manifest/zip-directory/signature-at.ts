/* @layer shared-store @kind logic */
import type { SignatureMark } from './zip-directory.type';

const signatureAt = (b: Uint8Array, at: number, [third, fourth]: SignatureMark): boolean =>
  b[at] === 0x50 && b[at + 1] === 0x4b && b[at + 2] === third && b[at + 3] === fourth;

export { signatureAt };
