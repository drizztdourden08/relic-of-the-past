/* @layer shared-store @kind logic */
import type { RangeReader } from '../range-reader.type';
import { findEndRecord } from './find-end-record';
import { parseCentralDirectory } from './parse-central-directory';
import { readExact } from './read-exact';
import { TAIL_BYTES } from './zip-directory.constants';
import type { ZipEntry } from './zip-directory.type';

const readZipDirectory = async (source: RangeReader): Promise<ZipEntry[]> => {
  const tailBytes = Math.min(TAIL_BYTES, source.bytes);
  const tail = await readExact(source, source.bytes - tailBytes, tailBytes);
  const end = findEndRecord(tail);
  if (end.directoryOffset + end.directoryBytes > source.bytes) {
    throw new Error('The central directory of the pack points past the end of the file.');
  }
  const dir = await readExact(source, end.directoryOffset, end.directoryBytes);
  return parseCentralDirectory(dir, end.entryCount);
};

export { readZipDirectory };
