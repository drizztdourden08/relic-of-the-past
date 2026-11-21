/* @layer shared-asset-extraction @kind logic */
import type { ReadByte, TokenRead } from './japanese-text.type';
import { US_PARAM_COMMANDS } from './japanese-commands.constants';
import {
  EXTENDED_LENGTH_TABLE, EXTENDED_PARAM_BIT, KANJI_BASE, OP_END, OP_EXTENDED, OP_FIRST_COMMAND, OP_KANJI, OP_SPACE,
  OP_SPEED,
} from './japanese-text.constants';
import { translateCommand } from './translate-commands';

const readExtended = (read: ReadByte, at: number): TokenRead => {
  const code = translateCommand(OP_EXTENDED, read(at + 1));
  const hasParam = (read(EXTENDED_LENGTH_TABLE + code) & EXTENDED_PARAM_BIT) !== 0;
  if (hasParam !== US_PARAM_COMMANDS.has(code)) {
    throw new Error(`readToken: command 0x${code.toString(16)} parameter length disagrees with the US table`);
  }
  if (!hasParam) return { token: { kind: 'command', code }, next: at + 2 };
  return { token: { kind: 'command', code, param: read(at + 2) }, next: at + 3 };
};

const readToken = (read: ReadByte, at: number): TokenRead => {
  const op = read(at);
  if (op < OP_FIRST_COMMAND || op === OP_SPACE) return { token: { kind: 'glyph', glyph: op }, next: at + 1 };
  if (op === OP_END) return { token: null, next: at + 1 };
  if (op === OP_KANJI) return { token: { kind: 'glyph', glyph: KANJI_BASE + read(at + 1) }, next: at + 2 };
  if (op === OP_SPEED) return { token: { kind: 'command', code: translateCommand(op), param: read(at + 1) }, next: at + 2 };
  if (op === OP_EXTENDED) return readExtended(read, at);
  return { token: { kind: 'command', code: translateCommand(op) }, next: at + 1 };
};

export { readToken };
