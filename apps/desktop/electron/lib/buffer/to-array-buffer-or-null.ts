/* @layer electron-main @kind logic */
import { toArrayBuffer } from './to-array-buffer';

const toArrayBufferOrNull = (buf: Buffer | null): ArrayBuffer | null =>
  buf ? toArrayBuffer(buf) : null;

export { toArrayBufferOrNull };
