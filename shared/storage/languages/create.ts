/* @layer shared-storage @kind logic */
/**
 * Creating sets. Both paths start from an existing set on disk: a new set
 * clones its dialogue as a translation starting point, a duplicate copies
 * everything. In both cases the font pair is copied file-for-file, so the new
 * set bakes without depending on the folder it came from.
 *
 * `base` is always inherited from the source set rather than pointing at it:
 * the bake step resolves the alphabet/dictionary/encoder from that value, so it
 * has to stay a real base language code even when the source is itself custom.
 */
import type { FileStore } from '@shared/platform';
import type { LanguageSet } from '@shared/game/language';
import { emptyNameTable } from '@shared/game/language';
import { getSet, getSetFont } from './read';
import { assertFreeSetId } from './set-id';
import { saveSet, writeSetFont } from './write';

type NewSetParams = { id: string; name: string; base: string };

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const requireSet = async (files: FileStore, id: string): Promise<LanguageSet> => {
  const set = await getSet(files, id);
  if (!set) throw new Error(`Language set "${id}" was not found.`);
  return set;
};

const copyFont = async (files: FileStore, fromId: string, toId: string): Promise<void> => {
  const font = await getSetFont(files, fromId);
  if (!font) throw new Error(`Language set "${fromId}" has no font files to copy.`);
  await writeSetFont(files, toId, font);
};

const store = async (files: FileStore, set: LanguageSet, fromId: string): Promise<LanguageSet> => {
  await saveSet(files, set);
  await copyFont(files, fromId, set.id);
  return set;
};

/** A fresh custom set seeded from `base`: its dialogue, and no variables of its own. */
const createSet = async (files: FileStore, params: NewSetParams): Promise<LanguageSet> => {
  const { id, name, base } = params;
  await assertFreeSetId(files, id);
  const source = await requireSet(files, base);
  return store(files, {
    id, name, base: source.base, origin: 'custom', version: 1,
    dialogue: clone(source.dialogue), glossary: [], names: emptyNameTable(),
    structure: source.structure,
  }, base);
};

/** A full copy of an existing set under a new id/name. */
const duplicateSet = async (files: FileStore, sourceId: string, id: string, name: string): Promise<LanguageSet> => {
  await assertFreeSetId(files, id);
  const source = await requireSet(files, sourceId);
  const { base, version, author, dialogue, glossary, names, variables, structure, text } = source;
  return store(files, {
    id, name, base, origin: 'custom', version, author,
    dialogue: clone(dialogue), glossary: clone(glossary), names: clone(names),
    variables: variables && clone(variables), structure, text: text && clone(text),
  }, sourceId);
};

export { createSet, duplicateSet };
export type { NewSetParams };
