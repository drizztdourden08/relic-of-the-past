/* @layer shared-asset-extraction @kind logic */
import { EXTRA_STRING, EXTRA_STRING_INDEX, SHORT_ROM_LINE_COUNT } from './build-language-entry.constants';

const normalizeTexts = (texts: string[]): string[] => {
  if (texts.length !== SHORT_ROM_LINE_COUNT) return texts;
  return [...texts.slice(0, EXTRA_STRING_INDEX), EXTRA_STRING, ...texts.slice(EXTRA_STRING_INDEX)];
};

export { normalizeTexts };
