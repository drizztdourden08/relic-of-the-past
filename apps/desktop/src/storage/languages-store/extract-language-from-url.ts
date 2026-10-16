/* @layer renderer-lib @kind logic */
import { fetchToBytes } from '@app/download/download';
import type { LanguageResult } from './languages-store.type';
import { extractPack } from './extract-pack';
import { languageImportJob } from './language-import-job';
import { resolveRomBytes } from './resolve-rom-bytes';

const extractLanguageFromUrl = (url: string): Promise<LanguageResult> =>
  languageImportJob(async (report) => {
    const bytes = await fetchToBytes(url, (loaded, total) => report.count('download', loaded, total ?? undefined));
    return extractPack(await resolveRomBytes(bytes), report);
  });

export { extractLanguageFromUrl };
