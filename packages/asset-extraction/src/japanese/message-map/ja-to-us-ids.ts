/* @layer shared-asset-extraction @kind logic */
import { MESSAGE_RANGES, US_MESSAGE_COUNT, US_ONLY_MESSAGES } from './message-map.constants';

const japaneseToUsMessages = (japanese: readonly string[]): string[] => {
  const us: (string | undefined)[] = new Array<string | undefined>(US_MESSAGE_COUNT).fill(undefined);
  MESSAGE_RANGES.forEach(({ us: usStart, japanese: jaStart, count }) => {
    for (let i = 0; i < count; i += 1) us[usStart + i] = japanese[jaStart + i];
  });
  US_ONLY_MESSAGES.forEach((text, id) => { us[id] = text; });
  return us.map((text, id) => {
    if (text === undefined) throw new Error(`japaneseToUsMessages: US message ${id} has no Japanese text`);
    return text;
  });
};

export { japaneseToUsMessages };
