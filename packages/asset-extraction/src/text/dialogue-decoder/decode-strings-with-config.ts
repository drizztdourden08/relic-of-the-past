/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import type { LanguageConfig } from '../data/language-data';
import type {
  DecodedString, DialogueCursor, DialogueDecodeContext, DialogueStep, RomByteReader,
} from './dialogue-decoder.type';
import { END_MESSAGE, PT_IGNORED_BANK_BYTES, PT_MESSAGE_COUNT } from './dialogue-decoder.constants';

const bankAddress = ({ info, lang }: DialogueDecodeContext, bank: number): number =>
  itemAt(info.romAddrs, bank, `${lang} dialogue bank address`);

const commandLength = ({ info, lang }: DialogueDecodeContext, c: number): number =>
  c >= info.commandStart && c < info.switchBank
    ? itemAt(info.commandLengths, c - info.commandStart, `${lang} dialogue command length`)
    : 1;

const appendCharacter = ({ getByte, info }: DialogueDecodeContext, cursor: DialogueCursor, c: number): void => {
  let ch = c;
  if (ch === info.escapeCharacter) {
    ch = getByte(cursor.p);
    cursor.p += 1;
    cursor.srcData.push(ch);
  }
  cursor.text += String(info.alphabet[ch]);
};

const appendCommand = ({ getByte, info }: DialogueDecodeContext, cursor: DialogueCursor, c: number, length: number): void => {
  const cmdName = String(info.commandNames[c - info.commandStart]);
  if (length !== 2) {
    cursor.text += `[${cmdName}]`;
    return;
  }
  cursor.srcData.push(getByte(cursor.p - 1));
  const param = getByte(cursor.p - 1);
  cursor.text += `[${cmdName} ${String(param).padStart(2, '0')}]`;
};

const switchBank = (ctx: DialogueDecodeContext, cursor: DialogueCursor): void => {
  cursor.p = bankAddress(ctx, cursor.romIdx);
  cursor.romIdx += 1;
  cursor.text = '';
  cursor.srcData = [];
};

const decodeStep = (ctx: DialogueDecodeContext, cursor: DialogueCursor): DialogueStep => {
  const { getByte, info, lang } = ctx;
  const c = getByte(cursor.p);
  cursor.srcData.push(c);
  const length = commandLength(ctx, c);
  cursor.p += length;

  if (c === END_MESSAGE) return 'message';
  if (c < info.commandStart) appendCharacter(ctx, cursor, c);
  else if (c < info.switchBank) appendCommand(ctx, cursor, c, length);
  else if (c === info.finish) return 'finish';
  else if (c === info.switchBank) switchBank(ctx, cursor);
  else if (c < info.switchBank + PT_IGNORED_BANK_BYTES) {
    if (lang !== 'pt') throw new Error(`Unexpected byte 0x${c.toString(16)} in ${lang} dialogue at 0x${(cursor.p - 1).toString(16)}`);
  } else cursor.text += String(info.dictionary[c - info.dictBaseDec]);
  return 'next';
};

const decodeStringsWithConfig = (getByte: RomByteReader, info: LanguageConfig, lang: string): DecodedString[] => {
  const ctx: DialogueDecodeContext = { getByte, info, lang };
  const cursor: DialogueCursor = { p: bankAddress(ctx, 0), romIdx: 1, text: '', srcData: [] };
  const result: DecodedString[] = [];

  for (;;) {
    const step = decodeStep(ctx, cursor);
    if (step === 'finish') return result;
    if (step === 'message') {
      result.push({ text: cursor.text, srcData: cursor.srcData });
      cursor.text = '';
      cursor.srcData = [];
      if (result.length >= PT_MESSAGE_COUNT && lang === 'pt') return result;
    }
  }
};

export { decodeStringsWithConfig };
