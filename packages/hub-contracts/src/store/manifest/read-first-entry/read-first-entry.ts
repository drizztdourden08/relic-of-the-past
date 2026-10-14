/* @layer shared-store @kind logic */
import { STORE_LIMITS } from '../../limits';
import { inflateRaw } from '../inflate-raw';
import { readLocalHeader } from '../zip-local-header';
import { METHOD_DEFLATE, METHOD_STORE } from './read-first-entry.constants';
import type { FirstEntryResult } from './read-first-entry.type';

const entryBytes = async (data: Uint8Array, method: number, size: number): Promise<Uint8Array | null> => {
  if (method === METHOD_STORE) return data.byteLength === size ? data : null;
  const inflated = await inflateRaw(data, STORE_LIMITS.manifestBytes);
  return inflated?.byteLength === size ? inflated : null;
};

const readFirstEntry = async (head: Uint8Array): Promise<FirstEntryResult> => {
  const result = readLocalHeader(head);
  if (!result.ok) return result;
  const { name, method, compressedSize, uncompressedSize, dataStart } = result.header;
  if (method !== METHOD_STORE && method !== METHOD_DEFLATE) return { ok: false, reason: 'method' };
  if (uncompressedSize > STORE_LIMITS.manifestBytes) return { ok: false, reason: 'too-large' };

  const data = head.subarray(dataStart, dataStart + compressedSize);
  const bytes = await entryBytes(data, method, uncompressedSize);
  if (!bytes) return { ok: false, reason: 'inflate' };

  const text = new TextDecoder().decode(bytes);
  try {
    return { ok: true, entry: { name, text, manifest: JSON.parse(text) as unknown } };
  } catch {
    return { ok: false, reason: 'json' };
  }
};

export { readFirstEntry };
