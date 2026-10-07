/* @layer shared-store @kind logic */
/**
 * Reads entry 0 of a pack from the head of its bytes and parses it as JSON. Every container
 * the store carries keeps its manifest there, so the API can check an upload from a ranged
 * read of its first bytes, and the app can check a download before unpacking it.
 *
 * `truncated` carries the byte count the entry needs, so a caller holding only the head can
 * fetch that much and try again.
 */
import { STORE_LIMITS } from '../limits';
import { inflateRaw } from './inflate-raw';
import { readLocalHeader } from './zip-local-header';
import type { HeaderFailure } from './zip-local-header';

const METHOD_STORE = 0;
const METHOD_DEFLATE = 8;

type FirstEntry = {
  /** The entry's name inside the archive. */
  name: string;
  text: string;
  /** The text parsed as JSON; not yet checked against any container's shape. */
  manifest: unknown;
};

type FirstEntryFailure = HeaderFailure | 'method' | 'too-large' | 'inflate' | 'json';

type FirstEntryResult =
  | { ok: true; entry: FirstEntry }
  | { ok: false; reason: FirstEntryFailure; needBytes?: number };

const entryBytes = async (data: Uint8Array, method: number, size: number): Promise<Uint8Array | null> => {
  if (method === METHOD_STORE) return data.byteLength === size ? data : null;
  const inflated = await inflateRaw(data, STORE_LIMITS.manifestBytes);
  return inflated && inflated.byteLength === size ? inflated : null;
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
export type { FirstEntry, FirstEntryFailure, FirstEntryResult };
