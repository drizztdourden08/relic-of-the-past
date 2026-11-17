/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import { extractJapaneseFont } from '../font/extract-japanese-font';
import { japaneseToUsMessages } from '../message-map/ja-to-us-ids';
import { JAPANESE_TEXT_FLAG, NOT_US_ROM_FLAG } from '../text/core-encoding.constants';
import { decodeJapaneseMessages } from '../text/decode-japanese-messages';
import { formatMessage } from '../text/format-message';
import type { ExtractedJapaneseLanguage } from './japanese-entry.type';

const extractJapaneseLanguage = (rom: RomData): ExtractedJapaneseLanguage => {
  const font = extractJapaneseFont(rom);
  const texts = japaneseToUsMessages(decodeJapaneseMessages(rom).map(formatMessage));
  return {
    code: rom.language,
    lines: texts.map((content, i) => ({ id: i + 1, content })),
    fontData: font.sheet,
    fontWidth: font.widths,
    glyphCount: font.glyphCount,
    lineCount: texts.length,
    flags: JAPANESE_TEXT_FLAG | NOT_US_ROM_FLAG,
  };
};

export { extractJapaneseLanguage };
