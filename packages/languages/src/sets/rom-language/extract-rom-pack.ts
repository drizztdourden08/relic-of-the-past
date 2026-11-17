/* @layer shared-game @kind logic */
import { extractLangEntry } from '@rotp/asset-extraction';
import type { RomData } from '@rotp/asset-extraction';
import type { ExtractedPack } from '../types';

const extractRomPack = (rom: RomData): ExtractedPack => {
  const entry = extractLangEntry(rom, rom.language, 1);
  return {
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
