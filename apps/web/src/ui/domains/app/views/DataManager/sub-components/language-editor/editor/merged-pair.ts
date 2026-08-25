/* @layer renderer-components @kind logic */
/**
 * Where the two halves of a merged picture character sit in the document.
 *
 * The model keeps both halves — they are two alphabet entries and the stored
 * entry must round-trip byte for byte — but every gesture treats them as one
 * character: the caret steps across the pair in one press, and one Backspace
 * takes both away. Everything that needs to know "is this position in the middle
 * of a picture" asks here, so the answer is derived once from the pairing the
 * sprite manifest already records rather than restated per command.
 *
 * Positions are DOCUMENT positions. Each half is an inline leaf of size one, so a
 * pair occupies `from`..`from + 2` and the position between the halves is the one
 * the browser could never paint a caret at.
 */
import { DIALOGUE_TOKEN_TYPE } from './token-attrs';
import { isMergedSecond, mergedSecondOf } from './merged-glyph';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

/** A pair, as the range that covers both halves. */
type MergedPairRange = {
  from: number;
  to: number;
};

/** The alphabet entry the token starting at `pos` draws, if it is a token at all. */
const glyphNameAt = (doc: ProseMirrorNode, pos: number): string | null => {
  if (pos < 0 || pos >= doc.content.size) return null;
  const node = doc.nodeAt(pos);
  if (node === null || node.type.name !== DIALOGUE_TOKEN_TYPE) return null;
  const { kind, name } = node.attrs;
  return kind === 'cmd' && typeof name === 'string' ? name : null;
};

/** True when the two halves of one picture start at `pos` and `pos + 1`. */
const pairStartsAt = (doc: ProseMirrorNode, pos: number): boolean => {
  const first = glyphNameAt(doc, pos);
  if (first === null) return false;
  const second = mergedSecondOf(first);
  return second !== null && glyphNameAt(doc, pos + 1) === second;
};

/** The pair whose first half starts at `pos`, or null when none does. */
const mergedPairAt = (doc: ProseMirrorNode, pos: number): MergedPairRange | null => (
  pairStartsAt(doc, pos) ? { from: pos, to: pos + 2 } : null
);

/** The pair whose second half ENDS at `pos`, or null when none does. */
const mergedPairEndingAt = (doc: ProseMirrorNode, pos: number): MergedPairRange | null => (
  pairStartsAt(doc, pos - 2) ? { from: pos - 2, to: pos } : null
);

/** The pair `pos` names one half of, whichever half that is. */
const mergedPairAround = (doc: ProseMirrorNode, pos: number): MergedPairRange | null => {
  const name = glyphNameAt(doc, pos);
  if (name === null) return null;
  if (isMergedSecond(name)) return mergedPairEndingAt(doc, pos + 1);
  return mergedPairAt(doc, pos);
};

/** True when `pos` falls between the two halves of one picture. */
const splitsMergedPair = (doc: ProseMirrorNode, pos: number): boolean =>
  pairStartsAt(doc, pos - 1);

export { mergedPairAround, mergedPairAt, mergedPairEndingAt, splitsMergedPair };
export type { MergedPairRange };
