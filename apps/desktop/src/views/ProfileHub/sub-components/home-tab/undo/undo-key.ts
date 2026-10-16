/* @layer renderer-components @kind logic */
import type { SaveListKind } from './undo.type';

const undoKey = (kind: SaveListKind, id: string | number): string => `${kind}:${id}`;

export { undoKey };
