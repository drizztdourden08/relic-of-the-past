/* @layer renderer-components @kind logic */
import { MOVE_KEYS } from '../SaveList.constants';
import type { RowKeyInput } from '../SaveList.type';

const rowKeyAction = (input: RowKeyInput): (() => void) | undefined => {
  const { key, id, ids, onDelete, onRename, moveTo } = input;
  const index = ids.indexOf(id);
  const move = MOVE_KEYS[key];
  if (index < 0) return undefined;
  if (move) return () => moveTo(ids[move(index, ids.length - 1)]);
  if (key === 'F2') return onRename && (() => onRename(id));
  if (key !== 'Delete' || !onDelete) return undefined;
  return () => {
    onDelete(id);
    moveTo(ids[index + 1] ?? ids[index - 1]);
  };
};

export { rowKeyAction };
