/* @layer shared-asset-extraction @kind logic */
/**
 * The content version an extracted sprite set is stamped with. Presence alone
 * cannot tell a set built by older code from a current one: every file it should
 * hold is there, only the bytes differ (a composite recipe, a drawing, a decoder
 * or the capacity-icon quantization changed). The stamp names what produced the
 * set, so the staleness check can refresh it.
 *
 * The version is two-part on purpose. The hash covers every input the code can
 * see at runtime (the definitions it extracts and the drawings it stamps), so a
 * changed recipe or SVG refreshes the set with no one remembering to bump
 * anything. The format constant covers what no input reflects: the decoders and
 * converters themselves, which change bytes without changing a definition. Either
 * part alone misses one of those two cases.
 */
import type { SpriteDef } from './extract-items';
import { ART_LIBRARY } from './art/art-library';
import { EXTRACTION_FORMAT_VERSION } from './capacity-icons';

const EXTRACTION_STAMP_FILE = 'extraction-stamp.json';

interface ExtractionStamp {
  version: string;
}

/**
 * FNV-1a, 32-bit: stable across runs and hosts, dependency-free, and sync so it
 * runs inside the pure extraction core. Not a security hash; a collision only
 * means one skipped refresh.
 */
const fnv1a = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

/** The drawings in name order, so the hash does not depend on the table's key order. */
const artEntries = (): [string, string][] =>
  Object.keys(ART_LIBRARY).sort().map((name) => [name, ART_LIBRARY[name]]);

/** `<format>-<hash>`: the version a set extracted from `defs` by this code carries. */
const extractionVersionOf = (defs: readonly SpriteDef[]): string =>
  `${EXTRACTION_FORMAT_VERSION}-${fnv1a(JSON.stringify({ defs, art: artEntries() }))}`;

/** The stamp file as an extraction buffer, written beside the PNGs. */
const extractionStampBuffer = (defs: readonly SpriteDef[]): { name: string; bytes: Uint8Array } => {
  const stamp: ExtractionStamp = { version: extractionVersionOf(defs) };
  return { name: EXTRACTION_STAMP_FILE, bytes: new TextEncoder().encode(JSON.stringify(stamp)) };
};

/** The version a stored stamp names; null for a missing or unreadable stamp. */
const parseExtractionStamp = (text: string | null | undefined): string | null => {
  if (text == null) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    const version = (parsed as Partial<ExtractionStamp> | null)?.version;
    return typeof version === 'string' ? version : null;
  } catch {
    return null;
  }
};

export { EXTRACTION_STAMP_FILE, extractionStampBuffer, extractionVersionOf, parseExtractionStamp };
export type { ExtractionStamp };
