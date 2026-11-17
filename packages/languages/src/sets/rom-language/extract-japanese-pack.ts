/* @layer shared-game @kind logic */
import { extractJapaneseLanguage } from '@rotp/asset-extraction';
import type { RomData } from '@rotp/asset-extraction';
import type { ExtractedPack } from '../types';

const extractJapanesePack = (rom: RomData): ExtractedPack => {
  const entry = extractJapaneseLanguage(rom);
  return {
    code: entry.code,
    description: rom.description,
    dialogue: `${entry.lines.map((line) => `${line.id}: ${line.content}`).join('\n')}\n`,
    fontData: new Uint8Array(entry.fontData),
    fontWidth: new Uint8Array(entry.fontWidth),
    glyphCount: entry.glyphCount,
    lineCount: entry.lineCount,
    encoder: 'org',
    flags: entry.flags,
    script: 'japanese',
  };
};

export { extractJapanesePack };
