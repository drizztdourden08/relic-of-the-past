/* @layer shared-game @kind logic */
import type { DialogueLineView } from '../lines/types';
import type { BlockDoc } from './types';

const flattenBlocks = (doc: BlockDoc): DialogueLineView[] => doc.blocks.flatMap(
  block => block.lines,
);

export { flattenBlocks };
