/* @layer shared-game @kind logic */
/**
 * Which box the caret is in, and how much room that box has left.
 *
 * The caret is addressed by line across the whole entry, because that is what an
 * editor's gutter counts and what `DialogueLineView.index` already means. Every
 * edit here needs the same three things from it — the box, where the box starts,
 * and how many lines it holds — so the walk is done once, in one place, and an
 * out-of-range caret is answered with null rather than a clamped guess.
 */
import type { BlockDoc } from '../blocks/types';
import type { Caret } from './types';

/** Where a caret sits, in block coordinates. */
type CaretSite = {
  /** 0-based block index. */
  block: number;
  /** First line of that block, counted across the entry. */
  blockStart: number;
  /** Lines the block currently holds. */
  linesInBlock: number;
  /** The caret's line within its block. */
  lineInBlock: number;
};

/** Locate a caret, or null when it names a line the document has not got. */
const locateCaret = (doc: BlockDoc, caret: Caret): CaretSite | null => {
  const { line } = caret;
  let blockStart = 0;

  for (const block of doc.blocks) {
    const linesInBlock = block.lines.length;
    if (line >= blockStart && line < blockStart + linesInBlock) {
      return { block: block.index, blockStart, linesInBlock, lineInBlock: line - blockStart };
    }
    blockStart += linesInBlock;
  }

  return null;
};

export { locateCaret };
export type { CaretSite };
