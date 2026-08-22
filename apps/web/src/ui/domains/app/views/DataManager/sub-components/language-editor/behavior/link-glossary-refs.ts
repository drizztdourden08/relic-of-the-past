/* @layer renderer-components @kind logic */
/**
 * Turning plain dialogue text into glossary references.
 *
 * A glossary term only earns its keep once the lines that say it actually
 * point at it: a `ref` token expands to the term's value at bake time, so a
 * line that holds a `ref` follows a later rename, while a line that holds the
 * literal text does not. These helpers find the literal occurrences and plan
 * the swap.
 *
 * CASE POLICY — detect insensitively, rewrite only on an exact match.
 * A `ref` bakes back as the term's value verbatim, so linking a run that reads
 * "FLUTE" to a term whose value is "Flute" would silently restyle the line;
 * shouted words are a real device in this dialogue and are not ours to
 * normalise. So an occurrence is linked only when its characters match the
 * term value exactly, and the ones that match ignoring case are counted
 * separately (`countGlossaryCaseMisses`) so the UI can say "6 to link, 2
 * differ in case" instead of quietly rewriting or quietly skipping them.
 * Fixing a near-miss stays a deliberate edit by the translator.
 */
import type { DialogueEntry, Token } from '@shared/game/language';

/** One entry's proposed new token stream, plus how many refs it gained. */
type LinkPlan = {
  entryId: number;
  tokens: Token[];
  hits: number;
};

/** Where a phrase sits inside one text run, split by the case policy. */
type RunScan = {
  /** Start indices of exact-case occurrences — the linkable ones. */
  exact: number[];
  /** How many occurrences matched only case-insensitively. */
  caseMiss: number;
};

/** Totals across a whole set, for the badges the glossary row shows. */
type PhraseTally = {
  exact: number;
  caseMiss: number;
};

/**
 * A single character is never a term worth linking (and would shred every
 * line it appears in), so the shortest linkable phrase is two characters.
 */
const kMinPhraseLength = 2;

/** A phrase too short (or empty) to link anything, so callers can bail early. */
const isLinkablePhrase = (phrase: string): boolean => phrase.length >= kMinPhraseLength;

/**
 * Locates `phrase` in one text run. Occurrences never overlap: the scan
 * advances past each match, so "aa" in "aaa" is one hit, not two.
 */
const scanRun = (text: string, phrase: string): RunScan => {
  const exact: number[] = [];
  let caseMiss = 0;

  const haystack = text.toLowerCase();
  const needle = phrase.toLowerCase();
  // Lowercasing can change a string's length for a handful of exotic
  // characters, which would misalign the indices we slice with. When that
  // happens, scan the original text instead so we can never rewrite the wrong
  // span — the cost is that near-misses go unreported for that run.
  const aligned = haystack.length === text.length && needle.length === phrase.length;
  const source = aligned ? haystack : text;
  const target = aligned ? needle : phrase;

  let cursor = 0;
  for (;;) {
    const at = source.indexOf(target, cursor);
    if (at === -1) break;
    if (text.slice(at, at + phrase.length) === phrase) exact.push(at);
    else caseMiss += 1;
    cursor = at + phrase.length;
  }

  return { exact, caseMiss };
};

/**
 * Rewrites one text run as text/ref/text pieces. Empty fragments are never
 * emitted, so a run that is exactly the phrase becomes a lone ref.
 */
const splitRun = (text: string, at: number[], phrase: string, key: string): Token[] => {
  const pieces: Token[] = [];
  let cursor = 0;

  for (const index of at) {
    if (index > cursor) pieces.push({ t: 'text', v: text.slice(cursor, index) });
    pieces.push({ t: 'ref', key });
    cursor = index + phrase.length;
  }
  if (cursor < text.length) pieces.push({ t: 'text', v: text.slice(cursor) });

  return pieces;
};

/**
 * Plans one entry, or returns null when nothing in it can be linked. Only
 * `text` tokens are searched, and each is rewritten in place: a phrase that
 * would span two runs (because a control code, a break or an existing ref
 * sits between them) is not a match and is left alone.
 */
const planEntry = (entry: DialogueEntry, phrase: string, key: string): LinkPlan | null => {
  const tokens: Token[] = [];
  let hits = 0;

  for (const token of entry.tokens) {
    if (token.t !== 'text') {
      tokens.push(token);
      continue;
    }
    const { exact } = scanRun(token.v, phrase);
    if (exact.length === 0) {
      tokens.push(token);
      continue;
    }
    hits += exact.length;
    for (const piece of splitRun(token.v, exact, phrase, key)) tokens.push(piece);
  }

  return hits === 0 ? null : { entryId: entry.id, tokens, hits };
};

/** Runs the scan over every text run of every entry, summing both categories. */
const tallyPhrase = (entries: DialogueEntry[], phrase: string): PhraseTally => {
  let exact = 0;
  let caseMiss = 0;
  if (!isLinkablePhrase(phrase)) return { exact, caseMiss };

  for (const entry of entries) {
    for (const token of entry.tokens) {
      if (token.t !== 'text') continue;
      const scan = scanRun(token.v, phrase);
      exact += scan.exact.length;
      caseMiss += scan.caseMiss;
    }
  }

  return { exact, caseMiss };
};

/**
 * One plan per entry that gains at least one ref. Inputs are never mutated:
 * untouched tokens are carried over by reference into a fresh array, and every
 * rewritten run produces new token objects.
 */
const planGlossaryLinks = (entries: DialogueEntry[], phrase: string, key: string): LinkPlan[] => {
  if (!isLinkablePhrase(phrase) || key.length === 0) return [];

  const plans: LinkPlan[] = [];
  for (const entry of entries) {
    const plan = planEntry(entry, phrase, key);
    if (plan) plans.push(plan);
  }

  return plans;
};

/**
 * How many occurrences `planGlossaryLinks` would link — the sum of every
 * plan's `hits`. Text already carried by a `ref` token is invisible to the
 * scan, so a linked occurrence is never offered twice.
 */
const countGlossaryLinkTargets = (entries: DialogueEntry[], phrase: string): number =>
  tallyPhrase(entries, phrase).exact;

/** How many occurrences match only when case is ignored, and so stay as text. */
const countGlossaryCaseMisses = (entries: DialogueEntry[], phrase: string): number =>
  tallyPhrase(entries, phrase).caseMiss;

export { countGlossaryCaseMisses, countGlossaryLinkTargets, planGlossaryLinks };
export type { LinkPlan };
