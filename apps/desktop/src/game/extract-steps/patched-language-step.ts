/* @layer bridge-wasm @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { buildLangData, dialogueFlags, kFontTypes, kLanguages } from '@rotp/asset-extraction';
import type { PatchedLanguage, PatchedPartReport } from '@rotp/asset-extraction';
import { extractPatchedLanguage, loadPatchedRomFromBuffer } from '@rotp/asset-extraction/buffer';
import { bakedLetterTable } from '@rotp/game-data';
import { defineStep } from './define-step';
import type { PatchedLanguageOutput } from './extract-steps.type';
import { libraryReferences } from './library-references';

const encodeCheck = (found: PatchedLanguage, base: string): { flags: number; failure: PatchedPartReport | null } => {
  try {
    const table = bakedLetterTable(found.texts, base);
    buildLangData(table.texts, base, table.glyphs, table.letters);
    return { flags: dialogueFlags(base, 1), failure: null };
  } catch (err) {
    const detail = msg('rom-loader:patched.dialogue.writeBack', { error: err instanceof Error ? err.message : String(err) });
    return { flags: 0, failure: { part: 'dialogue', status: 'failed', detail } };
  }
};

const patchedLanguageStep = defineStep<'patched-language'>((input, { romBytes }, report): PatchedLanguageOutput => {
  report.line(msg('data-manager:jobs.line.readPatchedRom'));
  const patched = loadPatchedRomFromBuffer(Buffer.from(romBytes), input.base);
  const library = libraryReferences(input.libraryRoms, input.base);
  const found = extractPatchedLanguage({
    patched, baseRom: library.baseRom, references: [...library.references, ...input.references],
  });
  const check = found.success ? encodeCheck(found, input.base) : { flags: 0, failure: null };
  const parts = check.failure
    ? found.parts.map((part) => (part.part === 'dialogue' ? check.failure ?? part : part))
    : found.parts;
  return {
    success: found.success && check.failure === null,
    parts,
    description: patched.description,
    dialogue: `${found.texts.map((text, i) => `${i + 1}: ${text}`).join('\n')}\n`,
    glyphCount: kFontTypes[input.base]?.widthCount ?? 0,
    lineCount: found.texts.length,
    encoder: kLanguages[input.base]?.encoder ?? 'org',
    flags: check.flags,
    menu: found.menu,
    credits: found.credits,
    screens: found.screens,
  };
});

export { patchedLanguageStep };
