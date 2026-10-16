/* @layer renderer-components @kind constants */
import type { ListItemShape } from '@drizztdourden08/tessera/composites';
import type { SaveListMove } from './SaveList.type';

const ROW_ATTRIBUTE = 'data-save-row';

const ROW_SHAPE: ListItemShape = { icon: true, columns: 0, action: true };

const MOVE_KEYS: Readonly<Record<string, SaveListMove>> = {
  ArrowDown: (index, last) => Math.min(index + 1, last),
  ArrowUp: (index) => Math.max(index - 1, 0),
  Home: () => 0,
  End: (_index, last) => last,
};

export { MOVE_KEYS, ROW_ATTRIBUTE, ROW_SHAPE };
