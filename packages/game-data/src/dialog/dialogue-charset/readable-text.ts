/* @layer shared-game @kind logic */
import type { DialogueCharset } from './dialogue-charset.type';
import { extraSlotOfToken } from './extra-slot-of-token';

const readableText = (text: string, charset: DialogueCharset): string => {
  const chars = new Map(charset.extras.map((extra) => [extra.slot, extra.char]));
  return [...text].map((ch) => chars.get(extraSlotOfToken(ch) ?? -1) ?? ch).join('');
};

export { readableText };
