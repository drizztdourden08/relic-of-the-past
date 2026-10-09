/* @layer renderer-components @kind logic */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { pairStartsAt } from './pair-starts-at';

const splitsMergedPair = (doc: ProseMirrorNode, pos: number): boolean =>
  pairStartsAt(doc, pos - 1);

export { splitsMergedPair };
