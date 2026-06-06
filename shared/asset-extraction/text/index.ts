/* @layer shared-asset-extraction @kind barrel */
export { kLanguages, dialogueFilename, usesNewFormat } from './language-data';
export type { LanguageConfig } from './language-data';
export { decodeStrings, decodeStringsWithConfig, formatDialogueText } from './dialogue-decoder';
export type { DecodedString } from './dialogue-decoder';
export { compressStrings, encodeDictionary } from './dialogue-encoder';
