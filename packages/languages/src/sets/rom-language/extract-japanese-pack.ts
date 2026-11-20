/* @layer shared-game @kind logic */
import { extractJapaneseLanguage, extractJapaneseScreens, jaScreenAddressesOf } from '@rotp/asset-extraction';
import type { RomData } from '@rotp/asset-extraction';
import type { ExtractedPack } from '../types';

const extractJapanesePack = (rom: RomData): ExtractedPack => {
  const entry = extractJapaneseLanguage(rom);
  return {
    code: entry.code,
    description: rom.description,
    dialogue: `${entry.lines.map((line) => `${line.id}: ${line.content}`).join('\n')}\n`,
    fontData: new Uint8Array(0),
    fontWidth: new Uint8Array(0),
    glyphCount: entry.glyphCount,
    lineCount: entry.lineCount,
    encoder: 'org',
    flags: entry.flags,
    script: 'japanese',
    screens: extractJapaneseScreens(rom, jaScreenAddressesOf(rom.revision)),
  };
};

export { extractJapanesePack };
