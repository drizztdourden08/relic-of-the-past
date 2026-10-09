/* @layer shared-asset-extraction @kind logic */
import type { DecodedString } from './dialogue-decoder.type';
import { SHORT_DUMP_LINE_COUNT, SHORT_DUMP_MISSING_INDEX, SHORT_DUMP_MISSING_TEXT } from './dialogue-decoder.constants';

const formatDialogueText = (strings: DecodedString[]): string => {
  let texts = strings;
  if (texts.length === SHORT_DUMP_LINE_COUNT) {
    texts = [
      ...texts.slice(0, SHORT_DUMP_MISSING_INDEX),
      { text: SHORT_DUMP_MISSING_TEXT, srcData: [] },
      ...texts.slice(SHORT_DUMP_MISSING_INDEX),
    ];
  }
  return texts.map((s, i) => `${i + 1}: ${s.text}`).join('\n') + '\n';
};

export { formatDialogueText };
