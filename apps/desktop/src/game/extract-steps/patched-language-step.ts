/* @layer bridge-wasm @kind logic */
import { buildPackedEntry, kLanguages } from '@rotp/asset-extraction';
import type { PatchedLanguage, PatchedPartReport } from '@rotp/asset-extraction';
import { extractPatchedLanguage, loadPatchedRomFromBuffer } from '@rotp/asset-extraction/buffer';
import { defineStep } from './define-step';
import type { PatchedLanguageOutput } from './extract-steps.type';
import { libraryReferences } from './library-references';

const encodeCheck = (found: PatchedLanguage, base: string): { flags: number; failure: PatchedPartReport | null } => {
  try {
    const { fontData, fontWidth, glyphs, texts } = found;
    const packed = buildPackedEntry({
      code: base, texts, fontData: Buffer.from(fontData), fontWidth: Buffer.from(fontWidth), index: 1, glyphs,
    });
    return { flags: packed.flags, failure: null };
  } catch (err) {
    const detail = `The text reads but cannot be written back: ${err instanceof Error ? err.message : String(err)}`;
    return { flags: 0, failure: { part: 'dialogue', status: 'failed', detail } };
  }
};

const patchedLanguageStep = defineStep<'patched-language'>((input, { romBytes }, report): PatchedLanguageOutput => {
  report.line('Reading the patched ROM...');
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
    fontData: found.fontData,
    fontWidth: found.fontWidth,
    glyphCount: found.fontWidth.length,
    lineCount: found.texts.length,
    encoder: kLanguages[input.base]?.encoder ?? 'org',
    flags: check.flags,
    glyphs: found.glyphs,
    menu: found.menu,
    credits: found.credits,
  };
});

export { patchedLanguageStep };
