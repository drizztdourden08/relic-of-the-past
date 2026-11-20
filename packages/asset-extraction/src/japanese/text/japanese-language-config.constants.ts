/* @layer shared-asset-extraction @kind constants */
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

export { JAPANESE_CONFIG_FIELDS, JAPANESE_LANGUAGE_ID, PARAM_COMMAND_LENGTH, PLAIN_COMMAND_LENGTH };
