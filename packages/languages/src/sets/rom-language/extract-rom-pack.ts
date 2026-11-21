/* @layer shared-game @kind logic */
import { extractLangEntry, extractScreens, kScreenAddresses } from '@rotp/asset-extraction';
import type { RomData } from '@rotp/asset-extraction';
import type { ExtractedPack } from '../types';
import { extractJapanesePack } from './extract-japanese-pack';
import { JAPANESE } from './extract-rom-pack.constants';

const extractRomPack = (rom: RomData): ExtractedPack => {
  if (rom.language === JAPANESE) return extractJapanesePack(rom);
  const entry = extractLangEntry(rom, rom.language, 1);
  const addresses = kScreenAddresses[rom.language];
  return {
    ...(addresses ? { screens: extractScreens(rom, addresses) } : {}),
    code: rom.language,
    description: rom.description,
    dialogue: `${entry.lines.map((line) => `${line.id}: ${line.content}`).join('\n')}\n`,
    fontData: new Uint8Array(entry.fontData),
    fontWidth: new Uint8Array(entry.fontWidth),
    glyphCount: entry.glyphCount,
    lineCount: entry.lineCount,
    encoder: entry.encoder,
    flags: entry.flags,
  };
};

export { extractRomPack };
