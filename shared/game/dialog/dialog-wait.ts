/* @layer shared-game @kind logic */
/**
 * The engine's own text command ids (kTextCmd_* in core/zelda3/src/messaging.c) that park it,
 * mapped to what the player is waiting on.
 */
import type { DialogWait } from './dialog-frame.types';

const TEXT_CMD_CHOOSE = 1;
const TEXT_CMD_ITEM = 2;
const TEXT_CMD_SELCHG = 8;
const TEXT_CMD_CHOOSE3 = 10;
const TEXT_CMD_CHOOSE2 = 11;
const TEXT_CMD_WAIT = 17;
const TEXT_CMD_WAITKEY = 23;
const TEXT_CMD_END = 24;

const CHOICE_COMMANDS = new Set([TEXT_CMD_CHOOSE, TEXT_CMD_SELCHG, TEXT_CMD_CHOOSE3, TEXT_CMD_CHOOSE2]);

const waitOf = (command: number): DialogWait => {
  if (command === TEXT_CMD_WAIT) return 'timed';
  if (command === TEXT_CMD_WAITKEY) return 'key';
  if (command === TEXT_CMD_END) return 'end';
  if (command === TEXT_CMD_ITEM) return 'item';
  if (CHOICE_COMMANDS.has(command)) return 'choice';
  return 'none';
};

export { waitOf };
