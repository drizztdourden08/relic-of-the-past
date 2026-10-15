/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguageSummary } from '@rotp/asset-extraction';
import { readPayloadMeta } from './read-payload-meta';

const listPacks = async (files: FileStore): Promise<LanguageSummary[]> => {
  const out: LanguageSummary[] = [];
  for (const id of await files.list('languages')) {
    const meta = await readPayloadMeta(files, id);
    if (meta) out.push({ code: meta.code, glyphCount: meta.glyphCount, lineCount: meta.lineCount });
  }
  return out;
};

export { listPacks };
