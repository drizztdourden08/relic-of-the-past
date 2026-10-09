/* @layer shared-store @kind logic */
import type { RangeReader } from '../range-reader.type';

const readExact = async (source: RangeReader, start: number, length: number): Promise<Uint8Array> => {
  if (length === 0) return new Uint8Array(0);
  const bytes = await source.range(start, length);
  if (bytes.byteLength !== length) {
    throw new Error(`The pack could not be read: asked for ${length} bytes at ${start}, got ${bytes.byteLength}.`);
  }
  return bytes;
};

export { readExact };
