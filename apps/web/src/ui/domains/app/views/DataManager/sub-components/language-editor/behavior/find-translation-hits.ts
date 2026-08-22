/* @layer renderer-components @kind logic */
/**
 * Pure full-set text search: walks a loaded language set once and returns every
 * place a lowercased needle occurs. No IPC, no fetching — purely derived from
 * the set the editor already holds.
 *
 * Dialogue is searched on its plain text, i.e. the concatenated `text` runs of
 * a token stream, so a control code sitting mid-sentence never breaks a match.
 * Chips (control-code names, glossary references) are searched separately and
 * reported as their own field, so a translator can find every use of a
 * reference or a command without those names polluting text results.
 */
import type { DialogueEntry, LanguageSet, Token } from '@shared/game/language';
import type { SearchHit } from '../language-editor.type';

const PREVIEW_SPAN = 56;

/** The tokens' visible text, exactly what a text search should see. */
const plainTextOf = (tokens: Token[]): string =>
  tokens.reduce((acc, token) => (token.t === 'text' ? acc + token.v : acc), '');

/** The searchable name of a non-text token, or null for a plain line break. */
const chipNameOf = (token: Token): string | null => {
  if (token.t === 'cmd') return token.name;
  if (token.t === 'ref') return token.key;
  if (token.t === 'var') return token.name;
  return null;
};

/** A single-line window around the match, elided on whichever side is cut. */
const excerpt = (text: string, at: number): string => {
  const flat = text.replace(/\s+/g, ' ');
  if (flat.length <= PREVIEW_SPAN) return flat;
  const start = Math.max(0, at - Math.floor(PREVIEW_SPAN / 3));
  const end = Math.min(flat.length, start + PREVIEW_SPAN);
  return `${start > 0 ? '…' : ''}${flat.slice(start, end)}${end < flat.length ? '…' : ''}`;
};

const hitIn = (text: string, needle: string): number => text.toLowerCase().indexOf(needle);

const dialogueHits = (entry: DialogueEntry, needle: string): SearchHit[] => {
  const found: SearchHit[] = [];
  const id = String(entry.id);
  const text = plainTextOf(entry.tokens);
  const atText = hitIn(text, needle);
  if (atText >= 0) {
    found.push({ kind: 'dialogue', id, field: 'text', entryId: entry.id, group: null, preview: excerpt(text, atText) });
  }
  const atNote = entry.note ? hitIn(entry.note, needle) : -1;
  if (entry.note && atNote >= 0) {
    found.push({ kind: 'dialogue', id, field: 'note', entryId: entry.id, group: null, preview: excerpt(entry.note, atNote) });
  }
  const chip = entry.tokens.map(chipNameOf).find((name) => name !== null && hitIn(name, needle) >= 0);
  if (chip) {
    found.push({ kind: 'dialogue', id, field: 'chip', entryId: entry.id, group: null, preview: chip });
  }
  return found;
};

const glossaryHits = (set: LanguageSet, needle: string): SearchHit[] => {
  const found: SearchHit[] = [];
  for (const term of set.glossary) {
    const atValue = hitIn(term.value, needle);
    if (atValue >= 0) {
      found.push({ kind: 'glossary', id: term.key, field: 'value', entryId: null, group: null, preview: excerpt(term.value, atValue) });
      continue;
    }
    if (hitIn(term.key, needle) >= 0) {
      found.push({ kind: 'glossary', id: term.key, field: 'key', entryId: null, group: null, preview: term.key });
    }
  }
  return found;
};

const nameHits = (set: LanguageSet, needle: string): SearchHit[] => {
  const { items, bottles, labels } = set.names;
  const groups = [
    { group: 'items' as const, rows: Object.entries(items) },
    { group: 'bottles' as const, rows: Object.entries(bottles) },
    { group: 'labels' as const, rows: Object.entries(labels) },
  ];
  const found: SearchHit[] = [];
  for (const { group, rows } of groups) {
    for (const [key, value] of rows) {
      const at = hitIn(value, needle);
      if (at < 0) continue;
      found.push({ kind: 'name', id: `${group}:${key}`, field: 'value', entryId: null, group, preview: excerpt(value, at) });
    }
  }
  return found;
};

/** Every hit for an already-lowercased, already-trimmed needle. */
const findTranslationHits = (set: LanguageSet, needle: string): SearchHit[] => {
  if (needle.length === 0) return [];
  const found: SearchHit[] = [];
  for (const entry of set.dialogue) found.push(...dialogueHits(entry, needle));
  found.push(...glossaryHits(set, needle));
  found.push(...nameHits(set, needle));
  return found;
};

export { findTranslationHits, plainTextOf };
