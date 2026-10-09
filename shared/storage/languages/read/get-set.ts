/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { LanguageSet } from '@shared/game/language';
import { readContent } from '../format-2';
import { migrateLegacySet } from '../migrate';
import { readDialogue } from './read-dialogue';
import { readSetMeta } from './read-set-meta';
import { readText } from './read-text';

const getSet = async (files: FileStore, id: string): Promise<LanguageSet | null> => {
  if (!await migrateLegacySet(files, id)) return null;
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
