/* @layer renderer-components @kind logic */
/**
 * Pure immutable transforms on a loaded language set. Every transform shares
 * everything it did not touch: only the edited entry gets a fresh `tokens`
 * array, which lets the validation layer skip the others by array identity.
 */
import type {
  DialogueEntry, GlossaryTerm, LanguageSet, SetStructure, TextGroupId, Token,
} from '@shared/game/language';
import type { NameEdit } from '../language-editor.type';

/** Replaces one entry, sharing the array when the id matches nothing. */
const mapEntry = (
  set: LanguageSet,
  id: number,
  change: (entry: DialogueEntry) => DialogueEntry,
): LanguageSet => {
  let found = false;
  const dialogue = set.dialogue.map((entry) => {
    if (entry.id !== id) return entry;
    found = true;
    return change(entry);
  });
  return found ? { ...set, dialogue } : set;
};

const withEntryTokens = (set: LanguageSet, id: number, tokens: Token[]): LanguageSet =>
  mapEntry(set, id, (entry) => ({ ...entry, tokens }));

/** Several entries at once, in one new set, so the debounced write never sees a half-applied snapshot. */
const withManyEntryTokens = (
  set: LanguageSet,
  edits: { entryId: number; tokens: Token[] }[],
): LanguageSet => {
  if (edits.length === 0) return set;
  const byId = new Map(edits.map((edit) => [edit.entryId, edit.tokens]));
  const dialogue = set.dialogue.map((entry) => {
    const tokens = byId.get(entry.id);
    return tokens === undefined ? entry : { ...entry, tokens };
  });
  return { ...set, dialogue };
};

// An emptied note drops back to undefined so it stays out of the written JSON.
const withEntryNote = (set: LanguageSet, id: number, note: string): LanguageSet =>
  mapEntry(set, id, (entry) => ({ ...entry, note: note.length > 0 ? note : undefined }));

/** The automation mode is part of the set, so changing it is a set edit. */
const withStructure = (set: LanguageSet, structure: SetStructure): LanguageSet => (
  set.structure === structure ? set : { ...set, structure }
);

/** One slot of one text group. A set only stores what a translator changed, so
 *  clearing a field drops the key; an empty string would read as a translation. */
const withTextValue = (
  set: LanguageSet,
  group: TextGroupId,
  key: string,
  value: string,
): LanguageSet => {
  const groups = set.text ?? {};
  const slots = { ...(groups[group] ?? {}) };
  if (value.length > 0) slots[key] = value;
  else delete slots[key];
  return { ...set, text: { ...groups, [group]: slots } };
};

const withNameValue = (set: LanguageSet, edit: NameEdit): LanguageSet => {
  const { names } = set;
  if (edit.group === 'items') {
    return { ...set, names: { ...names, items: { ...names.items, [edit.key]: edit.value } } };
  }
  if (edit.group === 'bottles') {
    return { ...set, names: { ...names, bottles: { ...names.bottles, [edit.key]: edit.value } } };
  }
  return { ...set, names: { ...names, labels: { ...names.labels, [edit.key]: edit.value } } };
};

/** Adds a term, or replaces the existing one with the same key in place. */
const withGlossaryTerm = (set: LanguageSet, term: GlossaryTerm): LanguageSet => {
  const at = set.glossary.findIndex((entry) => entry.key === term.key);
  const glossary = at < 0
    ? [...set.glossary, term]
    : set.glossary.map((entry, i) => (i === at ? term : entry));
  return { ...set, glossary };
};

const withoutGlossaryTerm = (set: LanguageSet, key: string): LanguageSet => {
  const glossary = set.glossary.filter((entry) => entry.key !== key);
  return glossary.length === set.glossary.length ? set : { ...set, glossary };
};

export {
  withEntryNote, withEntryTokens, withGlossaryTerm, withManyEntryTokens, withNameValue,
  withStructure, withTextValue,
  withoutGlossaryTerm,
};
