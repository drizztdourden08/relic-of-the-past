/* @layer renderer-lib @kind logic */
import type { LanguageResult } from './languages-store.type';
import { extractPack } from './extract-pack';
import { languageImportJob } from './language-import-job';
import { resolveRomBytes } from './resolve-rom-bytes';

const extractLanguageFromFile = (file: File): Promise<LanguageResult> =>
  languageImportJob(async (report) => extractPack(await resolveRomBytes(new Uint8Array(await file.arrayBuffer())), report));

export { extractLanguageFromFile };
