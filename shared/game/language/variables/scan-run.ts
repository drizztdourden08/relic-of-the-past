/* @layer shared-game @kind logic */
/**
 * Locating a phrase inside one text run, split by the case policy.
 *
 * CASE POLICY — detect insensitively, offer only an exact match.
 * A reference bakes back as the variable's value verbatim, so swapping a run
 * that reads a word in caps for a variable whose value is in title case would
 * silently restyle the line. Shouted words are a real device in this dialogue
 * and are not ours to normalise. So a run is offered for replacement only when
 * its characters match exactly, and the ones that match ignoring case are
 * reported separately, with their positions, so a caller can say "six to
 * replace, two differ in case" instead of quietly rewriting or quietly
 * dropping them. Fixing a near miss stays a deliberate edit.
 *
 * This is the same policy the editor's term-linking helper already applies to a
 * glossary term, ported down here because that helper lives in the renderer and
 * shared code cannot depend on it. It is now the one place the policy is
 * implemented, and the renderer copy can fold onto it when the picker lands.
 */

/**
 * A single character is never a phrase worth replacing (and would shred every
 * line it appears in), so the shortest one considered is two characters.
 */
const MIN_PHRASE_LENGTH = 2;

/** Where a phrase sits inside one text run, split by the case policy. */
type RunScan = {
  /** Start offsets of exact-case occurrences — the replaceable ones. */
  exact: number[];
  /** Start offsets of occurrences that match only when case is ignored. */
  caseMiss: number[];
};

const isSearchablePhrase = (phrase: string): boolean => phrase.length >= MIN_PHRASE_LENGTH;

/**
 * Occurrences never overlap: the scan advances past each match, so "aa" in
 * "aaa" is one hit, not two.
 */
const scanRun = (text: string, phrase: string): RunScan => {
  const exact: number[] = [];
  const caseMiss: number[] = [];
  if (!isSearchablePhrase(phrase)) return { exact, caseMiss };

  const haystack = text.toLowerCase();
  const needle = phrase.toLowerCase();
  // Lowercasing changes the length of a handful of exotic characters, which
  // would misalign the offsets a caller slices with. When that happens, scan
  // the original text instead so a wrong span can never be offered — the cost
  // is that near misses go unreported for that run.
  const aligned = haystack.length === text.length && needle.length === phrase.length;
  const source = aligned ? haystack : text;
  const target = aligned ? needle : phrase;

  let cursor = 0;
  for (;;) {
    const at = source.indexOf(target, cursor);
    if (at === -1) break;
    if (text.slice(at, at + phrase.length) === phrase) exact.push(at);
    else caseMiss.push(at);
    cursor = at + phrase.length;
  }

  return { exact, caseMiss };
};

export { isSearchablePhrase, MIN_PHRASE_LENGTH, scanRun };
export type { RunScan };
