/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguageSet } from '../../messages';
import { readContent } from '../format-2';
import { readDialogue } from './read-dialogue';
import { readSetMeta } from './read-set-meta';
import { readScreens } from './read-screens';
import { readText } from './read-text';

const getSet = async (files: FileStore, id: string): Promise<LanguageSet | null> => {
  const meta = await readSetMeta(files, id);
  if (!meta) return null;
  const screens = await readScreens(files, id);
  return {
    ...meta,
    dialogue: await readDialogue(files, id),
    text: await readText(files, id),
    ...await readContent(files, id),
    ...(screens ? { screens } : {}),
  };
};

export { getSet };
