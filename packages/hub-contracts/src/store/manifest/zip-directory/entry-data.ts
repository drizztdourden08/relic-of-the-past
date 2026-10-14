/* @layer shared-store @kind logic */
import { inflateRaw } from '../inflate-raw';
import type { RangeReader } from '../range-reader.type';
import { LOCAL_HEADER_BYTES, localDataOffset } from '../zip-local-header';
import { readExact } from './read-exact';
import type { ZipEntry } from './zip-directory.type';

const entryData = async (source: RangeReader, entry: ZipEntry, maxBytes?: number): Promise<Uint8Array> => {
  const head = await readExact(source, entry.offset, LOCAL_HEADER_BYTES);
  const dataOffset = localDataOffset(head);
  if (dataOffset === null) throw new Error(`The pack entry "${entry.name}" has no local header where the directory says.`);
  const start = entry.offset + dataOffset;
  const wanted = maxBytes === undefined ? entry.bytes : Math.min(entry.bytes, maxBytes);
  if (entry.method === 'store') return readExact(source, start, wanted);

  const inflated = await inflateRaw(await readExact(source, start, entry.compressedBytes), entry.bytes);
  if (inflated?.byteLength !== entry.bytes) {
    throw new Error(`The pack entry "${entry.name}" could not be inflated. The file may be damaged.`);
  }
  return wanted === entry.bytes ? inflated : inflated.subarray(0, wanted);
};

export { entryData };
