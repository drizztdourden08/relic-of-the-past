/* @layer renderer-components @kind logic */
/**
 * Pure immutable transforms on a loaded language set — the whole edit
 * vocabulary of the translation editor, kept out of the hook so it stays
 * testable and so the hook only has to worry about when to persist.
 *
 * Every transform returns a new set and shares everything it did not touch:
 * only the edited entry gets a fresh `tokens` array, which is what lets the
 * validation layer skip the other entries by array identity.
 */
import type { DialogueEntry, GlossaryTerm, LanguageSet, Token } from '@shared/game/language';
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

// An emptied note drops back to undefined so it stays out of the written JSON.
const withEntryNote = (set: LanguageSet, id: number, note: string): LanguageSet =>
  mapEntry(set, id, (entry) => ({ ...entry, note: note.length > 0 ? note : undefined }));

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
  withEntryNote, withEntryTokens, withGlossaryTerm, withNameValue, withoutGlossaryTerm,
};
