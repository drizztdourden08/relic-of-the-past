/* @layer shared-game @kind logic */
/**
 * The handful of small constructors and formatters every strategy reaches for.
 * Kept in one place so a strategy author never has to hand-roll `{ known:
 * true, value }` and risk getting the absent-vs-unread distinction wrong.
 */
import type { Probe } from './probe.types';

/**
 * The table WAS read and the value may legitimately be absent. This is not
 * the same thing as `unread()` below, and the difference is the crux of the
 * whole design: `known(undefined)` means "we looked, there is nothing there",
 * which is exactly as authoritative as `known(5)` meaning "we looked, it is
 * 5". A record that claims a value the live read comes back `known(undefined)`
 * for is a real `unbacked-in-dataset` finding. The game was CHECKED and
 * disagrees. A record compared against `unread()` gets no finding at all,
 * because there nothing was checked, so there is nothing to disagree with.
 * Mixing the two up either invents findings from a screen the tables were
 * never read for, or silently drops a real one.
 */
const known = <V>(value: V | undefined | null): Probe<V | undefined> => (
  { known: true, value: value ?? undefined }
);

/** The table was NOT read this pass. Silence, not a negative answer. */
const unread = <V>(): Probe<V> => ({ known: false });

/** `0x` + 2 uppercase hex digits, or a dash for anything not finite. */
const hex2 = (value: unknown): string => (
  typeof value === 'number' && Number.isFinite(value)
    ? `0x${(value & 0xff).toString(16).toUpperCase().padStart(2, '0')}`
    : '-'
);

/** `0x` + 4 uppercase hex digits, or a dash for anything not finite. */
const hex4 = (value: unknown): string => (
  typeof value === 'number' && Number.isFinite(value)
    ? `0x${(value & 0xffff).toString(16).toUpperCase().padStart(4, '0')}`
    : '-'
);

/**
 * The fallback formatter for a probe that does not supply its own `format`.
 * A dash for nothing, the primitive as-is for a primitive, and JSON for
 * anything structured. Good enough to read in a reason string, not meant to
 * be the last word for a probe that wants something nicer.
 */
const defaultFormat = (value: unknown): string => {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const isAbsent = (value: unknown): boolean => value === undefined || value === null;

export { defaultFormat, hex2, hex4, isAbsent, known, unread };
