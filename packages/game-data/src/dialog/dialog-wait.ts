/* @layer shared-game @kind logic */
import type { DialogWait } from './dialog-frame.types';
import { CHOICE_COMMANDS, TEXT_CMD_END, TEXT_CMD_ITEM, TEXT_CMD_WAIT, TEXT_CMD_WAITKEY } from './dialog-wait.constants';

const waitOf = (command: number): DialogWait => {
  if (command === TEXT_CMD_WAIT) return 'timed';
  if (command === TEXT_CMD_WAITKEY) return 'key';
  if (command === TEXT_CMD_END) return 'end';
  if (command === TEXT_CMD_ITEM) return 'item';
  if (CHOICE_COMMANDS.has(command)) return 'choice';
  return 'none';
};

export { waitOf };
