/* @layer shared-store @kind logic */
/**
 * Parses the local file header at offset 0 of a ZIP: the first entry's name, how it is
 * stored, and where its data sits. Only the fixed 30-byte header and the name are read, so a
 * few kilobytes from the head of a pack are enough.
 *
 * Layout (little-endian): signature 50 4B 03 04, version, flags, method, time, date, CRC-32,
 * compressed size, uncompressed size, name length, extra length, then the name and the extra.
 */

const HEADER_BYTES = 30;
const SIGNATURE = [0x50, 0x4b, 0x03, 0x04] as const;
const FLAG_ENCRYPTED = 0x0001;
const FLAG_DATA_DESCRIPTOR = 0x0008;
const SIZE_IN_ZIP64_EXTRA = 0xffffffff;

type LocalHeader = {
  name: string;
  /** 0 for STORE, 8 for DEFLATE. */
  method: number;
  compressedSize: number;
  uncompressedSize: number;
  /** Offset of the entry's data from the start of the archive. */
  dataStart: number;
};

type HeaderFailure = 'not-zip' | 'truncated' | 'encrypted' | 'streamed';

type HeaderResult =
  | { ok: true; header: LocalHeader }
  | { ok: false; reason: HeaderFailure; needBytes?: number };

const u16 = (b: Uint8Array, at: number): number => b[at] | (b[at + 1] << 8);
const u32 = (b: Uint8Array, at: number): number => (u16(b, at) | (u16(b, at + 2) << 16)) >>> 0;

const hasSignature = (head: Uint8Array): boolean => SIGNATURE.every((byte, i) => head[i] === byte);

/**
 * `streamed` covers the two layouts that keep the sizes out of the local header: a data
 * descriptor after the data, and ZIP64. The app's own exports use neither.
 */
const readLocalHeader = (head: Uint8Array): HeaderResult => {
  if (head.length < SIGNATURE.length || !hasSignature(head)) return { ok: false, reason: 'not-zip' };
  if (head.length < HEADER_BYTES) return { ok: false, reason: 'truncated', needBytes: HEADER_BYTES };

  const flags = u16(head, 6);
  if (flags & FLAG_ENCRYPTED) return { ok: false, reason: 'encrypted' };
  const compressedSize = u32(head, 18);
  const uncompressedSize = u32(head, 22);
  if (flags & FLAG_DATA_DESCRIPTOR || compressedSize === SIZE_IN_ZIP64_EXTRA
    || uncompressedSize === SIZE_IN_ZIP64_EXTRA) {
    return { ok: false, reason: 'streamed' };
  }

  const nameLength = u16(head, 26);
  const dataStart = HEADER_BYTES + nameLength + u16(head, 28);
  if (head.length < dataStart + compressedSize) {
    return { ok: false, reason: 'truncated', needBytes: dataStart + compressedSize };
  }
  const name = new TextDecoder().decode(head.subarray(HEADER_BYTES, HEADER_BYTES + nameLength));
  return { ok: true, header: { name, method: u16(head, 8), compressedSize, uncompressedSize, dataStart } };
};

export { readLocalHeader };
export type { LocalHeader, HeaderFailure, HeaderResult };
