/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import type { JapaneseToken } from './japanese-text.type';
import { MESSAGE_COUNT, TEXT_END, TEXT_START } from './japanese-text.constants';
import { readToken } from './read-token';

const decodeJapaneseMessages = (rom: RomData): JapaneseToken[][] => {
  const read = (addr: number): number => rom.getByte(addr);
  const messages: JapaneseToken[][] = [];
  let current: JapaneseToken[] = [];
  let at = TEXT_START;
  while (at < TEXT_END) {
    const { token, next } = readToken(read, at);
    if (token === null) {
      messages.push(current);
      current = [];
    } else {
      current.push(token);
    }
    at = next;
  }
  if (current.length > 0 || at !== TEXT_END) throw new Error('decodeJapaneseMessages: text block does not end on a message end');
  if (messages.length !== MESSAGE_COUNT) {
    throw new Error(`decodeJapaneseMessages: expected ${MESSAGE_COUNT} messages, got ${messages.length}`);
  }
  return messages;
};

export { decodeJapaneseMessages };
