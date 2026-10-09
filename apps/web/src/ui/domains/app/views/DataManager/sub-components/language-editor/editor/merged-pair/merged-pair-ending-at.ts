/* @layer renderer-components @kind logic */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { pairStartsAt } from './pair-starts-at';
import type { MergedPairRange } from './merged-pair.type';

const mergedPairEndingAt = (doc: ProseMirrorNode, pos: number): MergedPairRange | null => (
  pairStartsAt(doc, pos - 2) ? { from: pos - 2, to: pos } : null
);

export { mergedPairEndingAt };
