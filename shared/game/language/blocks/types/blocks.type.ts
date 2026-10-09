/* @layer shared-game @kind types */
import type { RowFit } from '../../layout/types';
import type { DialogueLineView } from '../../lines/types';

type Block = {
  index: number;
  lines: DialogueLineView[];
  ends: 'wait' | 'message-end';
  inherited: RowFit[];
};

type BlockDoc = { blocks: Block[] };

export type { Block, BlockDoc };
