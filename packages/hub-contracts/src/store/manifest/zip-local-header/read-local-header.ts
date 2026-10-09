/* @layer shared-store @kind logic */
import { hasSignature } from './has-signature';
import { u16 } from './u16';
import { u32 } from './u32';
import {
  COMPRESSED_SIZE_AT,
  EXTRA_LENGTH_AT,
  FLAGS_AT,
  FLAG_DATA_DESCRIPTOR,
  FLAG_ENCRYPTED,
  HEADER_BYTES,
  METHOD_AT,
  NAME_LENGTH_AT,
  SIGNATURE,
  SIZE_IN_ZIP64_EXTRA,
  UNCOMPRESSED_SIZE_AT,
} from './zip-local-header.constants';
import type { HeaderResult } from './zip-local-header.type';

const readLocalHeader = (head: Uint8Array): HeaderResult => {
  if (head.length < SIGNATURE.length || !hasSignature(head)) return { ok: false, reason: 'not-zip' };
  if (head.length < HEADER_BYTES) return { ok: false, reason: 'truncated', needBytes: HEADER_BYTES };

  const flags = u16(head, FLAGS_AT);
  if (flags & FLAG_ENCRYPTED) return { ok: false, reason: 'encrypted' };
  const compressedSize = u32(head, COMPRESSED_SIZE_AT);
  const uncompressedSize = u32(head, UNCOMPRESSED_SIZE_AT);
  if (flags & FLAG_DATA_DESCRIPTOR || compressedSize === SIZE_IN_ZIP64_EXTRA
    || uncompressedSize === SIZE_IN_ZIP64_EXTRA) {
    return { ok: false, reason: 'streamed' };
  }

  const nameLength = u16(head, NAME_LENGTH_AT);
  const dataStart = HEADER_BYTES + nameLength + u16(head, EXTRA_LENGTH_AT);
  if (head.length < dataStart + compressedSize) {
    return { ok: false, reason: 'truncated', needBytes: dataStart + compressedSize };
  }
  const name = new TextDecoder().decode(head.subarray(HEADER_BYTES, HEADER_BYTES + nameLength));
  return { ok: true, header: { name, method: u16(head, METHOD_AT), compressedSize, uncompressedSize, dataStart } };
};

export { readLocalHeader };
