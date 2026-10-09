/* @layer shared-asset-extraction @kind barrel */
export { kLanguages, dialogueFilename, usesNewFormat } from './data/language-data';
export type { LanguageConfig } from './data/language-data';
export { decodeStrings, decodeStringsWithConfig, formatDialogueText } from './dialogue-decoder';
export type { DecodedString } from './dialogue-decoder';
export { compressStrings, encodeDictionary } from './dialogue-encoder';
export { kFontTypes, FONT_TILE_COUNT, FONT_TILE_BYTES } from './data/font-data';
export type { FontSource } from './data/font-data';
export { extractLangEntry, buildPackedEntry, buildLangData, buildFontPacked, dialogueFlags } from './build-language-entry';
export type { PackedLangEntry, ExtractedLangEntry } from './build-language-entry';
export { parseDialogueText, dialogueTexts } from './parse-dialogue-text';
