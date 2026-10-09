/* @layer electron-main @kind logic */
import type { LanguageMeta, LanguageSummary } from '@rotp/asset-extraction';
import { listLanguageCodes } from './list-language-codes';
import { readMeta } from './read-meta';

const listLanguageSummaries = async (): Promise<LanguageSummary[]> => {
  const codes = await listLanguageCodes();
  const metas = await Promise.all(codes.map(readMeta));
  return metas
    .filter((m): m is LanguageMeta => m !== null)
    .map((m) => ({ code: m.code, glyphCount: m.glyphCount, lineCount: m.lineCount }));
};

export { listLanguageSummaries };
