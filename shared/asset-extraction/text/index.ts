/* @layer shared-asset-extraction @kind barrel */
export { kLanguages, dialogueFilename, usesNewFormat } from './data/language-data';
export type { LanguageConfig } from './data/language-data';
export { decodeStrings, decodeStringsWithConfig, formatDialogueText } from './dialogue-decoder';
export type { DecodedString } from './dialogue-decoder';
export { compressStrings, encodeDictionary } from './dialogue-encoder';
