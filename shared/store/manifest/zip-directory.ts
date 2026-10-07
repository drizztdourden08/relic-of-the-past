/* @layer shared-store @kind logic */
/**
 * Lists a ZIP from its central directory and reads one entry, using ranged reads only. A large
 * pack is never held whole: the listing costs the tail of the file plus the directory, and an
 * entry costs its own local header and data.
 *
 * End record layout (little-endian): signature 50 4B 05 06, disk numbers, entry counts, the
 * directory's size and offset, then a comment of up to 65535 bytes, which is why the search
 * covers the last 65557 bytes. Directory records are 46 fixed bytes, then name, extra, comment.
 *
 * ZIP64 and encrypted entries are refused: no pack the app writes uses either.
 */
import { inflateRaw } from './inflate-raw';
import { FLAG_ENCRYPTED, LOCAL_HEADER_BYTES, localDataOffset, u16, u32 } from './zip-local-header';
import type { RangeReader } from './range-reader.type';

type ZipEntry = {
  name: string;
  method: 'store' | 'deflate';
  /** Offset of the entry's local header from the start of the archive. */
  offset: number;
  compressedBytes: number;
  /** Size of the entry once inflated. */
  bytes: number;
};

type EndRecord = { entryCount: number; directoryBytes: number; directoryOffset: number };

const END_BYTES = 22;
const MAX_COMMENT = 0xffff;
const TAIL_BYTES = END_BYTES + MAX_COMMENT;
const DIRECTORY_RECORD_BYTES = 46;
const ZIP64_MARK_16 = 0xffff;
const ZIP64_MARK_32 = 0xffffffff;
const METHODS: Record<number, ZipEntry['method']> = { 0: 'store', 8: 'deflate' };

const signatureAt = (b: Uint8Array, at: number, third: number, fourth: number): boolean =>
  b[at] === 0x50 && b[at + 1] === 0x4b && b[at + 2] === third && b[at + 3] === fourth;

/** A range read that answers with anything but the bytes asked for is an error, never a guess. */
const readExact = async (source: RangeReader, start: number, length: number): Promise<Uint8Array> => {
  if (length === 0) return new Uint8Array(0);
  const bytes = await source.range(start, length);
  if (bytes.byteLength !== length) {
    throw new Error(`The pack could not be read: asked for ${length} bytes at ${start}, got ${bytes.byteLength}.`);
  }
  return bytes;
};

const findEndRecord = (tail: Uint8Array): EndRecord => {
  for (let at = tail.length - END_BYTES; at >= 0; at -= 1) {
    if (!signatureAt(tail, at, 0x05, 0x06)) continue;
    const entryCount = u16(tail, at + 10);
    const directoryBytes = u32(tail, at + 12);
    const directoryOffset = u32(tail, at + 16);
    const zip64 = (at >= 20 && signatureAt(tail, at - 20, 0x06, 0x07))
      || entryCount === ZIP64_MARK_16 || directoryBytes === ZIP64_MARK_32 || directoryOffset === ZIP64_MARK_32;
    if (zip64) throw new Error('This pack is a ZIP64 archive, which the viewer cannot read.');
    return { entryCount, directoryBytes, directoryOffset };
  }
  throw new Error('This file is not a ZIP archive: it has no end of central directory record.');
};

const parseRecord = (dir: Uint8Array, at: number): { entry: ZipEntry; next: number } => {
  if (at + DIRECTORY_RECORD_BYTES > dir.length || !signatureAt(dir, at, 0x01, 0x02)) {
    throw new Error('The central directory of the pack is damaged.');
  }
  const nameLength = u16(dir, at + 28);
  const name = new TextDecoder().decode(dir.subarray(at + DIRECTORY_RECORD_BYTES, at + DIRECTORY_RECORD_BYTES + nameLength));
  if (u16(dir, at + 8) & FLAG_ENCRYPTED) throw new Error(`The pack entry "${name}" is encrypted, which the viewer cannot read.`);
  const method = METHODS[u16(dir, at + 10)];
  if (!method) throw new Error(`The pack entry "${name}" uses a compression method the viewer cannot read.`);
  const compressedBytes = u32(dir, at + 20);
  const bytes = u32(dir, at + 24);
  const offset = u32(dir, at + 42);
  if (compressedBytes === ZIP64_MARK_32 || bytes === ZIP64_MARK_32 || offset === ZIP64_MARK_32) {
    throw new Error(`The pack entry "${name}" needs ZIP64, which the viewer cannot read.`);
  }
  const next = at + DIRECTORY_RECORD_BYTES + nameLength + u16(dir, at + 30) + u16(dir, at + 32);
  return { entry: { name, method, offset, compressedBytes, bytes }, next };
};

const parseCentralDirectory = (dir: Uint8Array, entryCount: number): ZipEntry[] => {
  const entries: ZipEntry[] = [];
  let at = 0;
  for (let index = 0; index < entryCount; index += 1) {
    const { entry, next } = parseRecord(dir, at);
    entries.push(entry);
    at = next;
  }
  return entries;
};

/** Every entry of the archive, in directory order, read from its end record and central directory. */
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

/**
 * One entry's bytes. A stored entry may be cut to its first `maxBytes`, so a long track can be
 * previewed without reading it all; a deflated entry is always inflated whole, then cut.
 */
const entryData = async (source: RangeReader, entry: ZipEntry, maxBytes?: number): Promise<Uint8Array> => {
  const head = await readExact(source, entry.offset, LOCAL_HEADER_BYTES);
  const dataOffset = localDataOffset(head);
  if (dataOffset === null) throw new Error(`The pack entry "${entry.name}" has no local header where the directory says.`);
  const start = entry.offset + dataOffset;
  const wanted = maxBytes === undefined ? entry.bytes : Math.min(entry.bytes, maxBytes);
  if (entry.method === 'store') return readExact(source, start, wanted);

  const inflated = await inflateRaw(await readExact(source, start, entry.compressedBytes), entry.bytes);
  if (!inflated || inflated.byteLength !== entry.bytes) {
    throw new Error(`The pack entry "${entry.name}" could not be inflated. The file may be damaged.`);
  }
  return wanted === entry.bytes ? inflated : inflated.subarray(0, wanted);
};

export { readZipDirectory, entryData };
export type { ZipEntry };
