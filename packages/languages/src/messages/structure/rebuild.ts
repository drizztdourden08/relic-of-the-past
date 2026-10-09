/* @layer shared-game @kind logic */
import { resolveInherited } from '../blocks/inherited-rows';
import { splitBlocks } from '../blocks/split-blocks';
import type { BlockDoc } from '../blocks/types';
import { joinLines } from '../lines/join-lines';
import { splitLines } from '../lines/split-lines';
import type { DialogueLineView } from '../lines/types';
import type { StructureContext } from './types';

const rebuild = (lines: DialogueLineView[], ctx: StructureContext): BlockDoc => {
  const { metrics, glossary, opts } = ctx;
  const derived = splitLines(joinLines(lines), metrics, glossary);

  return resolveInherited(splitBlocks(derived), metrics, glossary, opts);
};

export { rebuild };
