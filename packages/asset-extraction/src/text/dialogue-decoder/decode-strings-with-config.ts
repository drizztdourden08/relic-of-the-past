/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import type { LanguageConfig } from '../data/language-data';
import type { DecodedString, RomByteReader } from './dialogue-decoder.type';
import { END_MESSAGE, PT_IGNORED_BANK_BYTES, PT_MESSAGE_COUNT } from './dialogue-decoder.constants';

const decodeStringsWithConfig = (getByte: RomByteReader, info: LanguageConfig, lang: string): DecodedString[] => {
  const bankAddress = (bank: number): number => itemAt(info.romAddrs, bank, `${lang} dialogue bank address`);
  let p = bankAddress(0);
  let romIdx = 1;
  const result: DecodedString[] = [];

  while (true) {
    let s = '';
    let srcdata: number[] = [];

    while (true) {
      const c = getByte(p);
      srcdata.push(c);
      const l = (c >= info.commandStart && c < info.switchBank)
        ? itemAt(info.commandLengths, c - info.commandStart, `${lang} dialogue command length`)
        : 1;

      p += l;

      if (c === END_MESSAGE) {
        break;
      }
      if (c < info.commandStart) {
        let ch = c;
        if (ch === info.escapeCharacter) {
          ch = getByte(p);
          p += 1;
          srcdata.push(ch);
        }
        s += String(info.alphabet[ch]);
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
        return result;
      } else if (c === info.switchBank) {
        p = bankAddress(romIdx);
        romIdx += 1;
        s = '';
        srcdata = [];
      } else if (c < info.switchBank + PT_IGNORED_BANK_BYTES) {
        if (lang !== 'pt') {
          throw new Error(`Unexpected byte 0x${c.toString(16)} in ${lang} dialogue at 0x${(p - 1).toString(16)}`);
        }
      } else {
        s += info.dictionary[c - info.dictBaseDec];
      }
    }

    result.push({ text: s, srcData: srcdata });

    if (result.length >= PT_MESSAGE_COUNT && lang === 'pt') {
      return result;
    }
  }
};

export { decodeStringsWithConfig };
