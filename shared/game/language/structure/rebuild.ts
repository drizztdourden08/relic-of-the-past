/* @layer shared-game @kind logic */
/**
 * Back to a fully derived document, through the canonical split.
 *
 * Every edit in this folder works on a plain list of lines and only ever sets
 * the three authored fields — `advance`, `tokens`, `endsBox`. Everything else a
 * view carries is derived (its index, its box, its row, its widths), and rather
 * than each edit maintaining those by hand the edited list is written back out
 * as tokens and read again by the one walk that owns that numbering. So an
 * edit cannot invent a row number the layout engine disagrees with, and the two
 * cannot drift.
 *
 * The round trip is exact for anything these edits produce: `joinLines` emits a
 * line's own code, its content, then its wait, and `splitLines` cuts on exactly
 * those. The single shape it cannot carry is a line with no code, no content and
 * no wait — nothing to write, so nothing to read back — which is why an edit
 * that empties a line gives it a derived code first.
 */
import { resolveInherited } from '../blocks/inherited-rows';
import { splitBlocks } from '../blocks/split-blocks';
import type { BlockDoc } from '../blocks/types';
import { joinLines } from '../lines/join-lines';
import { splitLines } from '../lines/split-lines';
import type { DialogueLineView } from '../lines/types';
import type { StructureContext } from './types';

/** Re-derive a whole document from an edited line list. */
const rebuild = (lines: DialogueLineView[], ctx: StructureContext): BlockDoc => {
  const { metrics, glossary, opts } = ctx;
  const derived = splitLines(joinLines(lines), metrics, glossary);

  return resolveInherited(splitBlocks(derived), metrics, glossary, opts);
};

export { rebuild };
