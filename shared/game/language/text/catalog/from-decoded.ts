/* @layer shared-game @kind logic */
/**
 * Adapter from the decoder's output to catalog slots. This is how the menu and credits
 * groups get their contents.
 *
 * The decoded lines arrive as a PARAMETER, not an import: the decoder
 * lives in the asset-extraction pipeline, which reads a user ROM and has no
 * business being pulled in by a model this side of the app. `DecodedLine` is
 * therefore restated structurally here; the caller supplies whatever satisfies
 * it. Key and limit pass through untouched, since the decoder is the only thing
 * that knows what the surface actually measured.
 */
import type { TextSlot } from '../types';

/** One line as the decoder reports it, matched structurally, never imported. */
type DecodedLine = {
  key: string;
  text: string;
  limit: { kind: 'tiles'; max: number };
};

/** Group-wide adjustments the caller applies to every line it hands over. */
type DecodedSlotOptions = {
  /** Prefixed onto each key so two decoded groups can never collide. */
  keyPrefix?: string;
  /** Attached to every slot produced, as a caveat true of the whole surface. */
  note?: string;
};

/** Keys read as path-like, so the tail is the part that names the line. */
const lastSegment = (key: string): string => {
  const parts = key.split(/[:/.]/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : key;
};

const slotsFromDecoded = (lines: DecodedLine[], opts: DecodedSlotOptions = {}): TextSlot[] => {
  const { keyPrefix, note } = opts;
  return lines.map((line) => ({
    key: keyPrefix ? `${keyPrefix}${line.key}` : line.key,
    label: lastSegment(line.key),
    fallback: line.text,
    limit: line.limit,
    alphabet: 'pack' as const,
    ...(note ? { note } : {}),
  }));
};

export { slotsFromDecoded };
export type { DecodedLine, DecodedSlotOptions };
