/* @layer electron-main @kind logic */
/**
 * Language pack persistence. A pack lives in userData/Data/languages/<code>/ and
 * holds everything needed to bake the language into an asset blob and show it in
 * the inspector UI, without the source ROM:
 *
 *   dialogue.txt    decoded strings ("N: text"), source for re-compression + UI
 *   font.bin        raw 2bpp glyph sheet (256 tiles x 16 bytes)
 *   font-width.bin  per-glyph width table
 *   meta.json       LanguageMeta (glyph/line counts, encoder, flags, source ROM)
 */
import { join } from 'path';
import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import type { RomData } from '@shared/asset-extraction/rom/rom-types';
import { extractLangEntry, buildPackedEntry } from '@shared/asset-extraction/text/build-language-entry';
import type { PackedLangEntry } from '@shared/asset-extraction/text/build-language-entry';
import { parseDialogueText, dialogueTexts } from '@shared/asset-extraction/text/parse-dialogue-text';
import type { LanguageMeta, LanguagePack, LanguageSummary } from '@shared/types/language';
import { getUserDataPath } from '../lib/paths';

const langDir = (code: string): string => getUserDataPath('languages', code);
const dialoguePath = (code: string): string => join(langDir(code), 'dialogue.txt');
const fontPath = (code: string): string => join(langDir(code), 'font.bin');
const fontWidthPath = (code: string): string => join(langDir(code), 'font-width.bin');
const metaPath = (code: string): string => join(langDir(code), 'meta.json');

/** Extract one language from its ROM and persist the full pack. Returns the code stored. */
const extractLanguagePack = async (rom: RomData, code: string): Promise<LanguageMeta> => {
  const entry = extractLangEntry(rom, code, 1);
  const dir = langDir(code);
  await mkdir(dir, { recursive: true });

  const dialogue = entry.lines.map((l) => `${l.id}: ${l.content}`).join('\n') + '\n';
  const meta: LanguageMeta = {
    code,
    glyphCount: entry.glyphCount,
    lineCount: entry.lineCount,
    encoder: entry.encoder,
    flags: entry.flags,
    source: rom.description,
  };

  await Promise.all([
    writeFile(dialoguePath(code), dialogue, 'utf-8'),
    writeFile(fontPath(code), entry.fontData),
    writeFile(fontWidthPath(code), entry.fontWidth),
    writeFile(metaPath(code), JSON.stringify(meta, null, 2), 'utf-8'),
  ]);
  return meta;
};

/** All extracted language codes (directories that contain a meta.json). */
const listLanguageCodes = async (): Promise<string[]> => {
  try {
    const entries = await readdir(getUserDataPath('languages'), { withFileTypes: true });
    const codes: string[] = [];
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      try {
        await readFile(metaPath(e.name));
        codes.push(e.name);
      } catch { /* skip incomplete packs */ }
    }
    return codes;
  } catch {
    return [];
  }
};

const readMeta = async (code: string): Promise<LanguageMeta | null> => {
  try {
    return JSON.parse(await readFile(metaPath(code), 'utf-8')) as LanguageMeta;
  } catch {
    return null;
  }
};

const listLanguageSummaries = async (): Promise<LanguageSummary[]> => {
  const codes = await listLanguageCodes();
  const metas = await Promise.all(codes.map(readMeta));
  return metas
    .filter((m): m is LanguageMeta => m !== null)
    .map((m) => ({ code: m.code, glyphCount: m.glyphCount, lineCount: m.lineCount }));
};

/** Full inspector payload for one language. */
const readLanguagePack = async (code: string): Promise<LanguagePack | null> => {
  const meta = await readMeta(code);
  if (!meta) return null;
  try {
    const [text, font] = await Promise.all([
      readFile(dialoguePath(code), 'utf-8'),
      readFile(fontPath(code)),
    ]);
    return {
      meta,
      lines: parseDialogueText(text),
      font: { tiles: Array.from(font), glyphCount: meta.glyphCount },
    };
  } catch {
    return null;
  }
};

/** Pre-packed entries for every extracted language, ready to bake into an asset blob. */
const loadPackedLanguages = async (): Promise<PackedLangEntry[]> => {
  const codes = await listLanguageCodes();
  const entries = await Promise.all(codes.map(async (code) => {
    try {
      const [text, fontData, fontWidth] = await Promise.all([
        readFile(dialoguePath(code), 'utf-8'),
        readFile(fontPath(code)),
        readFile(fontWidthPath(code)),
      ]);
      return buildPackedEntry({ code, texts: dialogueTexts(text), fontData, fontWidth, index: 1 });
    } catch {
      return null;
    }
  }));
  return entries.filter((e): e is PackedLangEntry => e !== null);
};

export {
  extractLanguagePack,
  listLanguageSummaries,
  readLanguagePack,
  loadPackedLanguages,
};
