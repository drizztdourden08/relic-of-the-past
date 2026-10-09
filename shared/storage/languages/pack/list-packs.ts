/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguageSummary } from '@rotp/asset-extraction';
import { readLegacyMeta } from './read-legacy-meta';

const listPacks = async (files: FileStore): Promise<LanguageSummary[]> => {
  const out: LanguageSummary[] = [];
  for (const id of await files.list('languages')) {
    const meta = await readLegacyMeta(files, id);
    if (meta) out.push({ code: meta.code, glyphCount: meta.glyphCount, lineCount: meta.lineCount });
  }
  return out;
};

export { listPacks };
