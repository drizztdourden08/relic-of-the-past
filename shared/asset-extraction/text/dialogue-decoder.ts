/* @layer shared-asset-extraction @kind logic */
/**
 * Dialogue decoder — reads compressed dialogue strings from ROM.
 *
 * Ported from: upstream's text_compression.py decode_strings_generic()
 */
import type { LanguageConfig } from './data/language-data';
import { kLanguages } from './data/language-data';

interface DecodedString {
  text: string;
  srcData: number[];
}

const decodeStrings = (getByte: (addr: number) => number, lang: string): DecodedString[] => {
  const info = kLanguages[lang];
  if (!info) throw new Error(`Unknown language: ${lang}`);
  return decodeStringsWithConfig(getByte, info, lang);
};

const decodeStringsWithConfig = (getByte: (addr: number) => number, info: LanguageConfig, lang: string): DecodedString[] => {
  let p = info.romAddrs[0];
  let romIdx = 1;
  const result: DecodedString[] = [];

  while (true) {
    let s = '';
    let srcdata: number[] = [];

    while (true) {
      const c = getByte(p);
      srcdata.push(c);
      const l = (c >= info.commandStart && c < info.switchBank)
        ? info.commandLengths[c - info.commandStart]
        : 1;

      p += l;

      if (c === 0x7f) { // EndMessage
        break;
      }
      if (c < info.commandStart) {
        let ch = c;
        if (ch === info.escapeCharacter) {
          ch = getByte(p);
          p += 1;
          srcdata.push(ch);
        }
        s += info.alphabet[ch];
      } else if (c < info.switchBank) {
        if (l === 2) {
          srcdata.push(getByte(p - 1));
          const cmdName = info.commandNames[c - info.commandStart];
          const param = getByte(p - 1);
          s += `[${cmdName} ${String(param).padStart(2, '0')}]`;
        } else {
          s += `[${info.commandNames[c - info.commandStart]}]`;
        }
      } else if (c === info.finish) {
        return result; // done
      } else if (c === info.switchBank) {
        p = info.romAddrs[romIdx];
        romIdx += 1;
        s = '';
        srcdata = [];
      } else if (c < info.switchBank + 8) {
        if (lang !== 'pt') {
          throw new Error(`Unexpected byte 0x${c.toString(16)} in ${lang} dialogue at 0x${(p - 1).toString(16)}`);
        }
      } else {
        s += info.dictionary[c - info.dictBaseDec];
      }
    }

    result.push({ text: s, srcData: srcdata });

    if (result.length >= 397 && lang === 'pt') {
      return result;
    }
  }
};

const formatDialogueText = (strings: DecodedString[]): string => {
  let texts = strings;
  if (texts.length === 396) {
    const extraStr = '[Speed 00]0- [Number 00]. 1- [Number 01][2]2- [Number 02]. 3- [Number 03]';
    texts = [
      ...texts.slice(0, 4),
      { text: extraStr, srcData: [] },
      ...texts.slice(4),
    ];
  }
  return texts.map((s, i) => `${i + 1}: ${s.text}`).join('\n') + '\n';
};

export { decodeStrings, decodeStringsWithConfig, formatDialogueText };
export type { DecodedString };
