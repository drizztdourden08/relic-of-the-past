/* @layer shared-asset-extraction @kind logic */
/**
 * Build the binary dialogue + font entry the game core expects for one language.
 *
 * The core's kDialogue / kDialogueFont / kDialogueMap are parallel arrays; index 0
 * is the US ROM, extras follow. ZeldaSetLanguage(code) looks the code up in
 * kDialogueMap and pulls dialogue/font by the stored index.
 *
 * Ported from: upstream's compile_resources.py print_dialogue().
 */
import type { RomData } from '../rom/rom-types';
import type { DialogueLine } from '@shared/types/language';
import { packArrays } from '../asset-builder';
import { decodeStrings } from './dialogue-decoder';
import { compressStrings, encodeDictionary } from './dialogue-encoder';
import { kLanguages, usesNewFormat } from './data/language-data';
import { kFontTypes, FONT_TILE_BYTES } from './data/font-data';
import { RANDOMIZER_MSG_BASE, randomizerTemplateTexts } from './data/randomizer-templates';

/** Extra control string the US ROM omits; inserted at index 4 to reach 397 strings. */
const EXTRA_STRING = '[Speed 00]0- [Number 00]. 1- [Number 01][2]2- [Number 02]. 3- [Number 03]';

/** Pre-packed per-language data ready to drop into the dialogue arrays. */
interface PackedLangEntry {
  code: string;
  langData: Buffer;
  fontPacked: Buffer;
  /** Dialogue map flags: bit0 = new format, bit1 = no US ROM match. */
  flags: number;
}

/** Full result of extracting one language from its ROM (persisted by the language store). */
interface ExtractedLangEntry extends PackedLangEntry {
  /** Raw 2bpp glyph sheet (256 tiles x 16 bytes). */
  fontData: Buffer;
  /** Per-glyph width table. */
  fontWidth: Buffer;
  glyphCount: number;
  lineCount: number;
  encoder: 'org' | 'new';
  lines: DialogueLine[];
}

const dialogueFlags = (code: string, index: number): number => {
  return (usesNewFormat(code) ? 1 : 0) | (index > 0 ? 2 : 0);
};

/** Insert the missing control string so a 396-string ROM becomes the canonical 397. */
const normalizeTexts = (texts: string[]): string[] => {
  if (texts.length !== 396) return texts;
  return [...texts.slice(0, 4), EXTRA_STRING, ...texts.slice(4)];
};

const buildLangData = (texts: string[], code: string): Buffer => {
  // Append the randomizer template lines after the canonical vanilla lines, bake-time
  // only — dialogue.txt, meta.json and the Language Studio all keep seeing 397 lines.
  // The core addresses the templates as fixed message ids (kReceiptMsg_* in
  // core/game-hooks/game_hooks.h), so the vanilla count must be exact before appending.
  const vanilla = normalizeTexts(texts);
  if (vanilla.length !== RANDOMIZER_MSG_BASE) {
    throw new Error(`buildLangData: expected ${RANDOMIZER_MSG_BASE} vanilla dialogue lines for "${code}", got ${vanilla.length}`);
  }
  const all = [...vanilla, ...randomizerTemplateTexts(code)];
  const dictPacked = packArrays(encodeDictionary(code).map((d) => Buffer.from(d)));
  const dialoguePacked = packArrays(compressStrings(all, code).map((c) => Buffer.from(c)));
  return packArrays([dictPacked, dialoguePacked]);
};

const buildFontPacked = (fontData: Buffer, fontWidth: Buffer): Buffer => {
  return packArrays([fontData, fontWidth]);
};

/** Build a fully pre-packed entry from already-decoded texts + persisted font bytes. */
const buildPackedEntry = (params: {
  code: string;
  texts: string[];
  fontData: Buffer;
  fontWidth: Buffer;
  index: number;
}): PackedLangEntry => {
  const { code, texts, fontData, fontWidth, index } = params;
  return {
    code,
    langData: buildLangData(texts, code),
    fontPacked: buildFontPacked(fontData, fontWidth),
    flags: dialogueFlags(code, index),
  };
};

/** Extract a language directly from its ROM (used at US compile time and at pack extraction). */
const extractLangEntry = (rom: RomData, code: string, index: number): ExtractedLangEntry => {
  if (!kLanguages[code]) throw new Error(`Unknown language: ${code}`);
  const font = kFontTypes[code];
  if (!font) throw new Error(`No font source for language: ${code}`);

  const decoded = decodeStrings((addr) => rom.getByte(addr), code);
  const texts = normalizeTexts(decoded.map((d) => d.text));

  const fontData = rom.getBytes(font.tileAddr, FONT_TILE_BYTES);
  const fontWidth = rom.getBytes(font.widthAddr, font.widthCount);

  return {
    code,
    langData: buildLangData(texts, code),
    fontPacked: buildFontPacked(fontData, fontWidth),
    flags: dialogueFlags(code, index),
    fontData,
    fontWidth,
    glyphCount: font.widthCount,
    lineCount: texts.length,
    encoder: kLanguages[code].encoder,
    lines: texts.map((content, i) => ({ id: i + 1, content })),
  };
};

export { extractLangEntry, buildPackedEntry, buildLangData, buildFontPacked, dialogueFlags, EXTRA_STRING };
export type { PackedLangEntry, ExtractedLangEntry };
