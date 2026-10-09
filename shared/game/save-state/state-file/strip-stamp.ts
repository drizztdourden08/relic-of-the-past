/* @layer shared-game @kind logic */
import { trailerLength } from './trailer-length';

const stripStamp = (buffer: ArrayBuffer): ArrayBuffer => {
  const total = trailerLength(buffer);
  return total ? buffer.slice(0, buffer.byteLength - total) : buffer;
};

export { stripStamp };
