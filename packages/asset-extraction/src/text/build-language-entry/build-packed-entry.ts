/* @layer shared-asset-extraction @kind logic */
import type { PackedEntryParams, PackedLangEntry } from './build-language-entry.type';
import { buildFontPacked } from './build-font-packed';
import { buildLangData } from './build-lang-data';
import { dialogueFlags } from './dialogue-flags';

const buildPackedEntry = (params: PackedEntryParams): PackedLangEntry => {
  const { code, texts, fontData, fontWidth, index } = params;
  return {
    code,
    langData: buildLangData(texts, code),
    fontPacked: buildFontPacked(fontData, fontWidth),
    flags: dialogueFlags(code, index),
  };
};

export { buildPackedEntry };
