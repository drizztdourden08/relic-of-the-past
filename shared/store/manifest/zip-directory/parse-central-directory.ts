/* @layer shared-store @kind logic */
import { FLAG_ENCRYPTED, u16, u32 } from '../zip-local-header';
import { signatureAt } from './signature-at';
import {
  DIRECTORY_RECORD_BYTES,
  DIRECTORY_RECORD_MARK,
  METHODS,
  RECORD_BYTES_AT,
  RECORD_COMMENT_LENGTH_AT,
  RECORD_COMPRESSED_BYTES_AT,
  RECORD_EXTRA_LENGTH_AT,
  RECORD_FLAGS_AT,
  RECORD_METHOD_AT,
  RECORD_NAME_LENGTH_AT,
  RECORD_OFFSET_AT,
  ZIP64_MARK_32,
} from './zip-directory.constants';
import type { ZipEntry } from './zip-directory.type';

const parseRecord = (dir: Uint8Array, at: number): { entry: ZipEntry; next: number } => {
  if (at + DIRECTORY_RECORD_BYTES > dir.length || !signatureAt(dir, at, DIRECTORY_RECORD_MARK)) {
    throw new Error('The central directory of the pack is damaged.');
  }
  const nameLength = u16(dir, at + RECORD_NAME_LENGTH_AT);
  const name = new TextDecoder().decode(dir.subarray(at + DIRECTORY_RECORD_BYTES, at + DIRECTORY_RECORD_BYTES + nameLength));
  if (u16(dir, at + RECORD_FLAGS_AT) & FLAG_ENCRYPTED) throw new Error(`The pack entry "${name}" is encrypted, which the viewer cannot read.`);
  const method = METHODS[u16(dir, at + RECORD_METHOD_AT)];
  if (!method) throw new Error(`The pack entry "${name}" uses a compression method the viewer cannot read.`);
  const compressedBytes = u32(dir, at + RECORD_COMPRESSED_BYTES_AT);
  const bytes = u32(dir, at + RECORD_BYTES_AT);
  const offset = u32(dir, at + RECORD_OFFSET_AT);
  if (compressedBytes === ZIP64_MARK_32 || bytes === ZIP64_MARK_32 || offset === ZIP64_MARK_32) {
    throw new Error(`The pack entry "${name}" needs ZIP64, which the viewer cannot read.`);
  }
  const next = at + DIRECTORY_RECORD_BYTES + nameLength
    + u16(dir, at + RECORD_EXTRA_LENGTH_AT) + u16(dir, at + RECORD_COMMENT_LENGTH_AT);
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

export { parseCentralDirectory };
