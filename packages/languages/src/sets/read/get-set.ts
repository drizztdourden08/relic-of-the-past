/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguageSet } from '../../messages';
import { readContent } from '../format-2';
import { readDialogue } from './read-dialogue';
import { readSetMeta } from './read-set-meta';
import { readText } from './read-text';

const getSet = async (files: FileStore, id: string): Promise<LanguageSet | null> => {
  const meta = await readSetMeta(files, id);
  if (!meta) return null;
  return {
    ...meta,
    dialogue: await readDialogue(files, id),
    text: await readText(files, id),
    ...await readContent(files, id),
  };
};

export { getSet };
