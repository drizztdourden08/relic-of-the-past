/* @layer shared-game @kind logic */
import type { DialogueLineView } from '../lines/types';
import type { Block, BlockDoc } from './types';

const asBlock = (index: number, lines: DialogueLineView[], ends: Block['ends']): Block => ({
  index,
  lines,
  ends,
  inherited: [],
});

const splitBlocks = (lines: DialogueLineView[]): BlockDoc => {
  const blocks: Block[] = [];
  let open: DialogueLineView[] = [];

  for (const line of lines) {
    open.push(line);
    if (!line.endsBox) continue;

    blocks.push(asBlock(blocks.length, open, 'wait'));
    open = [];
  }

  if (open.length > 0) blocks.push(asBlock(blocks.length, open, 'message-end'));
  return { blocks };
};

export { splitBlocks };
