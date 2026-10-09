/* @layer renderer-components @kind logic */
import type { FlexSelection } from '../../FlexEditor.type';

const chipOf = (selection: FlexSelection): string | null => {
  if (selection.kind === 'none') return null;
  return selection.indices.length === 1
    ? `item ${Math.min(...selection.indices) + 1}`
    : `${selection.indices.length} items`;
};

export { chipOf };
