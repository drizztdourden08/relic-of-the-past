/* @layer renderer-components @kind logic */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { pairStartsAt } from './pair-starts-at';
import type { MergedPairRange } from './merged-pair.type';

const mergedPairAt = (doc: ProseMirrorNode, pos: number): MergedPairRange | null => (
  pairStartsAt(doc, pos) ? { from: pos, to: pos + 2 } : null
);

export { mergedPairAt };
