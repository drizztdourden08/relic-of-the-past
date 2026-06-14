/* @layer shared-storage @kind logic */
/**
 * Language pack storage over FileStore, mirroring the Electron layout
 * (languages/<code>/{dialogue.txt,font.bin,font-width.bin,meta.json}). Extraction
 * itself runs in the worker; this module does the FileStore I/O + list/read.
 */
import type { FileStore } from '@shared/platform';
import type { LanguageSummary, LanguagePack, LanguageMeta } from '@shared/types/language';
import { parseDialogueText } from '@shared/asset-extraction/text/parse-dialogue-text';
import { readJson } from './json';

interface ExtractedPack {
  code: string;
  description: string;
  dialogue: string;
  fontData: Uint8Array;
  fontWidth: Uint8Array;
  glyphCount: number;
  lineCount: number;
  encoder: 'org' | 'new';
  flags: number;
}

const langDir = (code: string): string => `languages/${code}`;
const readMeta = (files: FileStore, code: string): Promise<LanguageMeta | null> =>
  readJson<LanguageMeta | null>(files, `${langDir(code)}/meta.json`, null);

const list = async (files: FileStore): Promise<LanguageSummary[]> => {
  const out: LanguageSummary[] = [];
  for (const code of await files.list('languages')) {
    const meta = await readMeta(files, code);
    if (meta) out.push({ code: meta.code, glyphCount: meta.glyphCount, lineCount: meta.lineCount });
  }
  return out;
};

const getLanguage = async (files: FileStore, code: string): Promise<LanguagePack | null> => {
  const meta = await readMeta(files, code);
  if (!meta) return null;
  const text = await files.readText(`${langDir(code)}/dialogue.txt`);
  const font = await files.readBytes(`${langDir(code)}/font.bin`);
  if (text == null || !font) return null;
  return { meta, lines: parseDialogueText(text), font: { tiles: Array.from(font), glyphCount: meta.glyphCount } };
};

const writePack = async (files: FileStore, pack: ExtractedPack): Promise<void> => {
  const dir = langDir(pack.code);
  const meta: LanguageMeta = {
    code: pack.code, glyphCount: pack.glyphCount, lineCount: pack.lineCount,
    encoder: pack.encoder, flags: pack.flags, source: pack.description,
  };
  await files.writeText(`${dir}/dialogue.txt`, pack.dialogue);
  await files.writeBytes(`${dir}/font.bin`, pack.fontData);
  await files.writeBytes(`${dir}/font-width.bin`, pack.fontWidth);
  await files.writeText(`${dir}/meta.json`, JSON.stringify(meta, null, 2));
};

const remove = (files: FileStore, code: string): Promise<void> => files.remove(langDir(code));

export { list, getLanguage, writePack, remove };
export type { ExtractedPack };
