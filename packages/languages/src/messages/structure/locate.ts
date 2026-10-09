/* @layer shared-game @kind logic */
import type { BlockDoc } from '../blocks/types';
import type { Caret, CaretSite } from './types';

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
