/* @layer renderer-lib @kind logic */
import { languages, slugSetId } from '@rotp/languages';
import type { PatchedLanguageOutput } from '@app/game/extract-steps';
import { runExtractStep } from '../extraction-client';
import { recompileAll } from '../assets-store';
import { errorMessage } from '../error-message';
import { runImportJob } from '../import-job';
import type { ImportReport } from '../import-job';
import { platformFiles } from '../platform-files';
import { getLanguageSet } from './get-language-set';
import { libraryRomBytes } from './library-rom-bytes';
import type { PatchedImportRequest, PatchedImportResult } from './patched-import.type';
import { FAILED_PATCHED_IMPORT } from './languages-store.constants';
import { resolveRomBytes } from './resolve-rom-bytes';
import { setFontReferences } from './set-font-references';

const runImport = async (request: PatchedImportRequest, report: ImportReport): Promise<PatchedImportResult> => {
  const id = slugSetId(request.name);
  if (await getLanguageSet(id)) {
    return { success: false, error: `A language set with the id "${id}" already exists. Pick another name.`, parts: [] };
  }
  report.phase('decode', 'Reading the patched ROM...');
  const romBytes = await resolveRomBytes(new Uint8Array(await request.file.arrayBuffer()));
  const input = { base: request.base, libraryRoms: await libraryRomBytes(), references: await setFontReferences(request.base) };
  const found = await runExtractStep<'patched-language', PatchedLanguageOutput>({
    step: 'patched-language', title: 'Reading a patched ROM', subject: id, romBytes, input,
  });
  if (!found.success) return { success: false, error: FAILED_PATCHED_IMPORT, parts: found.parts };
  const { description, dialogue, glyphCount, lineCount, encoder, flags } = found;
  await languages.writePatchedPack(platformFiles(), {
    code: id, description, dialogue, glyphCount, lineCount, encoder, flags,
    name: request.name.trim(), base: request.base,
    credits: request.credits, license: request.license,
    text: { menu: found.menu, credits: found.credits },
  });
  report.phase('extract', 'Baking into assets...');
  await recompileAll();
  return { success: true, code: id, parts: found.parts };
};

const importPatchedLanguage = async (request: PatchedImportRequest): Promise<PatchedImportResult> => {
  try {
    return await runImportJob({
      kind: 'language', title: 'Importing a patched language', work: (report) => runImport(request, report),
      failureOf: (result) => (result.success ? null : result.error),
    });
  } catch (err) {
    return { success: false, error: errorMessage(err), parts: [] };
  }
};

export { importPatchedLanguage };
