/* @layer shared-store @kind logic */
import { u16, u32 } from '../zip-local-header';
import { signatureAt } from './signature-at';
import {
  END_BYTES,
  END_DIRECTORY_BYTES_AT,
  END_DIRECTORY_OFFSET_AT,
  END_ENTRY_COUNT_AT,
  END_RECORD_MARK,
  ZIP64_LOCATOR_BYTES,
  ZIP64_LOCATOR_MARK,
  ZIP64_MARK_16,
  ZIP64_MARK_32,
} from './zip-directory.constants';
import type { EndRecord } from './zip-directory.type';

const findEndRecord = (tail: Uint8Array): EndRecord => {
  for (let at = tail.length - END_BYTES; at >= 0; at -= 1) {
    if (!signatureAt(tail, at, END_RECORD_MARK)) continue;
    const entryCount = u16(tail, at + END_ENTRY_COUNT_AT);
    const directoryBytes = u32(tail, at + END_DIRECTORY_BYTES_AT);
    const directoryOffset = u32(tail, at + END_DIRECTORY_OFFSET_AT);
    const zip64 = (at >= ZIP64_LOCATOR_BYTES && signatureAt(tail, at - ZIP64_LOCATOR_BYTES, ZIP64_LOCATOR_MARK))
      || entryCount === ZIP64_MARK_16 || directoryBytes === ZIP64_MARK_32 || directoryOffset === ZIP64_MARK_32;
    if (zip64) throw new Error('This pack is a ZIP64 archive, which the viewer cannot read.');
    return { entryCount, directoryBytes, directoryOffset };
  }
  throw new Error('This file is not a ZIP archive: it has no end of central directory record.');
};

export { findEndRecord };
