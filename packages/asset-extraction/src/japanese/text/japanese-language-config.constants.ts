/* @layer shared-asset-extraction @kind constants */
import type { LanguageConfig } from '../../text/data/language-data/language-data.type';
import { GLYPH_LIMIT, IDEOGRAPHIC_SPACE } from './japanese-charset.constants';
import { US_COMMAND_NAMES, US_COMMAND_START, US_PARAM_COMMANDS } from './japanese-commands.constants';
import { glyphToChar } from './glyph-to-char';
import type { JapaneseConfigFields } from './japanese-text.type';

const JAPANESE_LANGUAGE_ID = 'ja';

const PARAM_COMMAND_LENGTH = 2;

const PLAIN_COMMAND_LENGTH = 1;

const JAPANESE_CONFIG_FIELDS: JapaneseConfigFields = {
  dictionary: [],
  romAddrs: [],
  switchBank: 0x80,
  finish: 0xff,
  dictBaseEnc: 0x88,
  dictBaseDec: 0x88,
  escapeCharacter: null,
  encoder: 'org',
};

const commandLength = (index: number): number =>
  US_PARAM_COMMANDS.has(US_COMMAND_START + index) ? PARAM_COMMAND_LENGTH : PLAIN_COMMAND_LENGTH;

const JAPANESE_LANGUAGE_CONFIG: LanguageConfig = {
  ...JAPANESE_CONFIG_FIELDS,
  id: JAPANESE_LANGUAGE_ID,
  alphabet: [...Array.from({ length: GLYPH_LIMIT }, (_, glyph) => glyphToChar(glyph)), IDEOGRAPHIC_SPACE],
  commandLengths: US_COMMAND_NAMES.map((_, index) => commandLength(index)),
  commandNames: [...US_COMMAND_NAMES],
  commandStart: US_COMMAND_START,
};

export { JAPANESE_CONFIG_FIELDS, JAPANESE_LANGUAGE_CONFIG, JAPANESE_LANGUAGE_ID, PARAM_COMMAND_LENGTH, PLAIN_COMMAND_LENGTH };
