/* @layer shared-game @kind logic */
/**
 * Where a set spells a name out instead of referencing it.
 *
 * A variable only earns its keep once the lines that say it point at it: a
 * reference follows a later rename, literal text does not. This is the pure
 * half of that job — it reports every run that could become a reference and
 * says which variable it should be, and changes nothing. Applying a report is a
 * separate, deliberate step.
 *
 * Only `text` runs are searched, so a phrase broken by a control code, a line
 * break or an existing reference is not a match — the same rule the editor's
 * term linking has always followed. Case policy and its near-miss reporting
 * live in `./scan-run`.
 *
 * Widest match wins inside one run: once a span is claimed, a shorter phrase
 * overlapping it is not reported, so a line is never offered two readings of
 * the same characters.
 */
import type { DialogueEntry } from '../types';
import type { Candidate } from './hardcoded-candidates';
import { hardcodedCandidates } from './hardcoded-candidates';
import { scanRun } from './scan-run';
import type { Variable } from './types';

/** One run of literal text that should reference a variable. */
type Occurrence = {
  /** Dialogue entry the run sits in. */
  entryId: number;
  /** Position of the text token inside that entry's stream. */
  tokenIndex: number;
  /** Offset of the match inside that token's text. */
  at: number;
  /** The characters actually present in the line. */
  text: string;
  /** Variable the run should reference. */
  variableKey: string;
  /** False when that variable does not exist in the set yet. */
  exists: boolean;
  /**
   * `exact` is safe to swap. `case` matched only with case ignored and is
   * reported for a translator to judge, never rewritten.
   */
  match: 'exact' | 'case';
};

type Span = { from: number; to: number };

const overlaps = (claimed: Span[], from: number, to: number): boolean =>
  claimed.some((span) => from < span.to && span.from < to);

const occurrenceAt = (
  entryId: number, tokenIndex: number, at: number,
  candidate: Candidate, match: Occurrence['match'],
): Occurrence => ({
  entryId,
  tokenIndex,
  at,
  text: candidate.phrase,
  variableKey: candidate.variableKey,
  exists: candidate.exists,
  match,
});

/** Every reportable match in one text run, widest phrase claiming first. */
const scanTextToken = (
  entryId: number, tokenIndex: number, text: string, candidates: Candidate[],
): Occurrence[] => {
  const found: Occurrence[] = [];
  const claimed: Span[] = [];

  for (const candidate of candidates) {
    const { length } = candidate.phrase;
    const { exact, caseMiss } = scanRun(text, candidate.phrase);

    for (const at of exact) {
      if (overlaps(claimed, at, at + length)) continue;
      claimed.push({ from: at, to: at + length });
      found.push(occurrenceAt(entryId, tokenIndex, at, candidate, 'exact'));
    }
    for (const at of caseMiss) {
      if (overlaps(claimed, at, at + length)) continue;
      found.push(occurrenceAt(entryId, tokenIndex, at, candidate, 'case'));
    }
  }

  return found.sort((a, b) => a.at - b.at);
};

/**
 * Every occurrence across a set, in reading order. `variables` supplies both
 * the answers (its own terms and menu names) and what the catalog still has to
 * propose.
 */
const findHardcoded = (entries: DialogueEntry[], variables: Variable[]): Occurrence[] => {
  const candidates = hardcodedCandidates(variables);
  const found: Occurrence[] = [];

  for (const entry of entries) {
    entry.tokens.forEach((token, tokenIndex) => {
      if (token.t !== 'text') return;
      for (const hit of scanTextToken(entry.id, tokenIndex, token.v, candidates)) found.push(hit);
    });
  }

  return found;
};

export { findHardcoded };
export type { Occurrence };
