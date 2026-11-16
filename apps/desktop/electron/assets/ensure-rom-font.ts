/* @layer electron-main @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { extractLangEntry } from '@rotp/asset-extraction';
import type { RomData } from '@rotp/asset-extraction';
import { languages } from '@rotp/languages';

const ensureRomFont = async (files: FileStore, rom: RomData): Promise<string[]> => {
  const missing = await languages.missingRomFonts(files);
  if (missing.includes(rom.language)) {
    const { fontData, fontWidth } = extractLangEntry(rom, rom.language, 0);
    await languages.writeRomFont(files, rom.language, { fontData, fontWidth });
  }
  return missing.filter((base) => base !== rom.language);
};

export { ensureRomFont };
