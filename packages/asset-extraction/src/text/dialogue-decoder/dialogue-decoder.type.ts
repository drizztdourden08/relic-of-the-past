/* @layer shared-asset-extraction @kind types */
import type { LanguageConfig } from '../data/language-data';

interface DecodedString {
  text: string;
  srcData: number[];
}

type RomByteReader = (addr: number) => number;

interface DialogueDecodeContext {
  getByte: RomByteReader;
  info: LanguageConfig;
  lang: string;
}

interface DialogueCursor {
  p: number;
  romIdx: number;
  text: string;
  srcData: number[];
}

type DialogueStep = 'message' | 'finish' | 'next';

export type { DecodedString, DialogueCursor, DialogueDecodeContext, DialogueStep, RomByteReader };
