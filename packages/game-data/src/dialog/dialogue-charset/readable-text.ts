/* @layer shared-game @kind logic */
import { letterOfToken } from '../latin-letters/table/letter-of-token';
import type { DialogueCharset } from './dialogue-charset.type';
import { extraSlotOfToken } from './extra-slot-of-token';

const readableText = (text: string, charset: DialogueCharset): string => {
  const chars = new Map(charset.extras.map((extra) => [extra.slot, extra.char]));
  const letters = new Map((charset.letters ?? []).map((letter) => [letter.index, letter.char]));
  return [...text]
    .map((ch) => chars.get(extraSlotOfToken(ch) ?? -1) ?? letters.get(letterOfToken(ch) ?? -1) ?? ch)
    .join('');
};

export { readableText };
