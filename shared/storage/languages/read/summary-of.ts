/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { migrateLegacySet } from '../migrate';
import type { LanguageSetSummary } from '../types';
import { readDialogue } from './read-dialogue';
import { readSetMeta } from './read-set-meta';

const summaryOf = async (files: FileStore, id: string): Promise<LanguageSetSummary | null> => {
  if (!await migrateLegacySet(files, id)) return null;
  const meta = await readSetMeta(files, id);
  if (!meta) return null;
  const { name, base, origin } = meta;
  return { id: meta.id, name, base, origin, lineCount: (await readDialogue(files, id)).length };
};

export { summaryOf };
