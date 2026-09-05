/* @layer shared-game @kind logic */
/**
 * What the log calls a flag change no check accounts for.
 *
 * Purely a display string. It used to double as the matcher's return value, which
 * put a fake name in the same slot real check identities travelled through, so
 * "did this diff match anything" was answered by comparing against a sentinel.
 * The matcher now returns nothing at all, and this is only ever printed.
 */
const UNIDENTIFIED = 'unidentified change';

export { UNIDENTIFIED };
