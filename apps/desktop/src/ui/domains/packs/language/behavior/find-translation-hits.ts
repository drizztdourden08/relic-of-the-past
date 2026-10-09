/* @layer renderer-components @kind logic */
import type { DialogueEntry, LanguageSet, Token } from '@shared/game/language';
import type { SearchHit } from './translation-search.type';
import { PREVIEW_SPAN } from './language-behavior.constants';

const plainTextOf = (tokens: Token[]): string =>
  tokens.reduce((acc, token) => (token.t === 'text' ? acc + token.v : acc), '');

const chipNameOf = (token: Token): string | null => {
  if (token.t === 'cmd') return token.name;
  if (token.t === 'ref') return token.key;
  if (token.t === 'var') return token.name;
  return null;
};

const excerpt = (text: string, at: number): string => {
  const flat = text.replace(/\s+/g, ' ');
  if (flat.length <= PREVIEW_SPAN) return flat;
  const start = Math.max(0, at - Math.floor(PREVIEW_SPAN / 3));
  const end = Math.min(flat.length, start + PREVIEW_SPAN);
  return `${start > 0 ? '...' : ''}${flat.slice(start, end)}${end < flat.length ? '...' : ''}`;
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

const findTranslationHits = (set: LanguageSet, lowercaseTrimmedNeedle: string): SearchHit[] => {
  if (lowercaseTrimmedNeedle.length === 0) return [];
  const found: SearchHit[] = [];
  for (const entry of set.dialogue) found.push(...dialogueHits(entry, lowercaseTrimmedNeedle));
  found.push(...glossaryHits(set, lowercaseTrimmedNeedle));
  found.push(...nameHits(set, lowercaseTrimmedNeedle));
  return found;
};

export { findTranslationHits };
