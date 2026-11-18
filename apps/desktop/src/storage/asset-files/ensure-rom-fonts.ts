/* @layer renderer-lib @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { languages } from '@rotp/languages';
import type { ExtractedPack } from '@rotp/languages';
import { runExtractStep } from '../extraction-client';
import { LocalizedError } from '../localized-error';

const ensureRomFonts = async (files: FileStore, romBytes: Uint8Array): Promise<void> => {
  const missing = await languages.missingRomFonts(files);
  if (missing.length === 0) return;
  const pack = await runExtractStep<'language', ExtractedPack>({
    step: 'language', title: 'Reading the base fonts', subject: 'rom', romBytes, input: undefined,
  });
  await languages.writeRomFont(files, pack.code, { fontData: pack.fontData, fontWidth: pack.fontWidth });
  const lacking = missing.filter((base) => base !== pack.code);
  if (lacking.length > 0) {
    throw new LocalizedError(msg('errors:rom.fontMissing', { languages: lacking }));
  }
};

export { ensureRomFonts };
