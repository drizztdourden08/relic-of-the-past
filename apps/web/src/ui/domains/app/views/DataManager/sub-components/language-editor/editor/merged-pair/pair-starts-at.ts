/* @layer renderer-components @kind logic */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { mergedSecondOf } from '../merged-glyph';
import { glyphNameAt } from './glyph-name-at';

const pairStartsAt = (doc: ProseMirrorNode, pos: number): boolean => {
  const first = glyphNameAt(doc, pos);
  if (first === null) return false;
  const second = mergedSecondOf(first);
  return second !== null && glyphNameAt(doc, pos + 1) === second;
};

export { pairStartsAt };
