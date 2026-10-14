/* @layer shared-game @kind logic */
import type { DialogueEntry } from '../types';
import { hardcodedCandidates } from './hardcoded-candidates';
import { scanRun } from './scan-run';
import type { Candidate, Occurrence, Span, Variable } from './types';

const overlaps = (claimed: Span[], from: number, to: number): boolean =>
  claimed.some((span) => from < span.to && span.from < to);

const occurrenceAt = (
  site: { entryId: number; tokenIndex: number; at: number },
  candidate: Candidate,
  match: Occurrence['match'],
): Occurrence => ({
  ...site,
  text: candidate.phrase,
  variableKey: candidate.variableKey,
  exists: candidate.exists,
  match,
});

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
      found.push(occurrenceAt({ entryId, tokenIndex, at }, candidate, 'exact'));
    }
    for (const at of caseMiss) {
      if (overlaps(claimed, at, at + length)) continue;
      found.push(occurrenceAt({ entryId, tokenIndex, at }, candidate, 'case'));
    }
  }

  return found.sort((a, b) => a.at - b.at);
};

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
