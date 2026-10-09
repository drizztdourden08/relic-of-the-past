/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { LanguageSet } from '@shared/game/language';
import { emptyNameTable } from '@shared/game/language';
import { assertFreeSetId } from '../set-id';
import { clone } from './clone';
import type { CreateSetParams } from './create.type';
import { requireSet } from './require-set';
import { saveWithFont } from './save-with-font';

const createSet = async (files: FileStore, params: CreateSetParams): Promise<LanguageSet> => {
  const { id, name, base } = params;
  await assertFreeSetId(files, id);
  const source = await requireSet(files, base);
  return saveWithFont(files, {
    id, name, base: source.base, origin: 'custom', version: 1,
    dialogue: clone(source.dialogue), glossary: [], names: emptyNameTable(),
    structure: source.structure,
  }, base);
};

export { createSet };
