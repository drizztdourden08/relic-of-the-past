/* @layer renderer-components @kind logic */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { isMergedSecond } from '../merged-glyph';
import { glyphNameAt } from './glyph-name-at';
import { mergedPairAt } from './merged-pair-at';
import { mergedPairEndingAt } from './merged-pair-ending-at';
import type { MergedPairRange } from './merged-pair.type';

const mergedPairAround = (doc: ProseMirrorNode, pos: number): MergedPairRange | null => {
  const name = glyphNameAt(doc, pos);
  if (name === null) return null;
  if (isMergedSecond(name)) return mergedPairEndingAt(doc, pos + 1);
  return mergedPairAt(doc, pos);
};

export { mergedPairAround };
