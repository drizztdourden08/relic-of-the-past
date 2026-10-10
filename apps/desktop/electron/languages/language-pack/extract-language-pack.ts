/* @layer electron-main @kind logic */
import { writeFile, mkdir } from 'fs/promises';
import type { RomData, LanguageMeta } from '@rotp/asset-extraction';
import { extractLangEntry } from '@rotp/asset-extraction';
import { languagePackPaths } from './language-pack-paths';

const extractLanguagePack = async (rom: RomData, code: string): Promise<LanguageMeta> => {
  const entry = extractLangEntry(rom, code, 1);
  const dir = languagePackPaths.dir(code);
  await mkdir(dir, { recursive: true });

  const dialogue = `${entry.lines.map((l) => `${l.id}: ${l.content}`).join('\n')}\n`;
  const meta: LanguageMeta = {
    code,
    glyphCount: entry.glyphCount,
    lineCount: entry.lineCount,
    encoder: entry.encoder,
    flags: entry.flags,
    source: rom.description,
  };

  await Promise.all([
    writeFile(languagePackPaths.dialogue(code), dialogue, 'utf-8'),
    writeFile(languagePackPaths.font(code), entry.fontData),
    writeFile(languagePackPaths.fontWidth(code), entry.fontWidth),
    writeFile(languagePackPaths.meta(code), JSON.stringify(meta, null, 2), 'utf-8'),
  ]);
  return meta;
};

export { extractLanguagePack };
