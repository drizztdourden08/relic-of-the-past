/* @layer shared-asset-extraction @kind logic */
import type { JapaneseToken } from './japanese-text.type';
import { US_COMMAND_NAMES, US_COMMAND_START } from './japanese-commands.constants';
import { glyphToChar } from './glyph-to-char';

const formatToken = (token: JapaneseToken): string => {
  if (token.kind === 'glyph') return glyphToChar(token.glyph);
  const name = US_COMMAND_NAMES[token.code - US_COMMAND_START];
  if (name === undefined) throw new Error(`formatMessage: no command name for 0x${token.code.toString(16)}`);
  return token.param === undefined ? `[${name}]` : `[${name} ${String(token.param).padStart(2, '0')}]`;
};

const formatMessage = (tokens: readonly JapaneseToken[]): string => tokens.map(formatToken).join('');

export { formatMessage };
