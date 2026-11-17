/* @layer shared-asset-extraction @kind logic */
import { JAPANESE_EXTENDED_COMMANDS, JAPANESE_SIMPLE_COMMANDS } from './japanese-commands.constants';
import { OP_EXTENDED } from './japanese-text.constants';

const hex = (value: number): string => `0x${value.toString(16)}`;

const translateCommand = (op: number, sub = 0): number => {
  if (op === OP_EXTENDED) {
    if (!JAPANESE_EXTENDED_COMMANDS.has(sub)) throw new Error(`translateCommand: unknown extended command ${hex(sub)}`);
    return sub;
  }
  const code = JAPANESE_SIMPLE_COMMANDS.get(op);
  if (code === undefined) throw new Error(`translateCommand: unknown command byte ${hex(op)}`);
  return code;
};

export { translateCommand };
