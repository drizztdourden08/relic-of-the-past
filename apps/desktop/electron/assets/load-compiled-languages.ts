/* @layer electron-main @kind logic */
import type { RomData } from '@rotp/asset-extraction';
import { compileBake, extractRomPack, keepRomLanguage, languages, readLanguageSets, romSetInput } from '@rotp/languages';
import type { BakedLanguages } from '@rotp/languages';
import { createNodeFileStore } from '../lib/node-file-store';
import { logToRenderer } from '../lib/renderer-log';

const warn = (message: string): void => logToRenderer('app', 'warn', message);

const loadCompiledLanguages = async (rom: RomData): Promise<BakedLanguages> => {
  const files = createNodeFileStore();
  const romLanguage = extractRomPack(rom);
  await keepRomLanguage(files, romLanguage);
  const lacking = await languages.missingRomFonts(files);
  if (lacking.length > 0) {
    warn(`Language sets on ${lacking.join(', ')} skipped: that base font is missing. Import that language's ROM first.`);
  }
  return compileBake(await readLanguageSets(files), romSetInput(romLanguage), warn);
};

export { loadCompiledLanguages };
