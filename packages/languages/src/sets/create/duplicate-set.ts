/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguageSet } from '../../messages';
import { assertFreeSetId } from '../set-id';
import { saveSet } from '../write';
import { clone } from './clone';
import { requireSet } from './require-set';

const duplicateSet = async (files: FileStore, sourceId: string, id: string, name: string): Promise<LanguageSet> => {
  await assertFreeSetId(files, id);
  const source = await requireSet(files, sourceId);
  const { base, version, author, dialogue, glossary, names, variables, structure, text, script, screens } = source;
  const set: LanguageSet = {
    id, name, base, origin: 'custom', version, author,
    dialogue: clone(dialogue), glossary: clone(glossary), names: clone(names),
    variables: variables && clone(variables), structure, text: text && clone(text),
    script, ...(screens ? { screens } : {}),
  };
  await saveSet(files, set);
  return set;
};

export { duplicateSet };
