/* @layer shared-game @kind logic */
/**
 * Group lines into blocks. The cut, and nothing else.
 *
 * A line already knows whether a wait-for-button follows it (`endsBox`), so the
 * boundary is read off the lines instead of re-derived from tokens: one walk
 * decides where boxes end, and this step only reads its verdict. Lines are
 * carried through untouched, which is what lets `flattenBlocks` be an exact
 * inverse and keeps an unedited entry serialising byte for byte.
 *
 * Content left after the last wait becomes a final block ending in
 * `message-end`. The player sees it and the message then closes on its own.
 * No block is ever empty: every line belongs to exactly one, and a stretch
 * between two waits with nothing in it is a single line with no content, not a
 * block with no lines.
 *
 * The inherited rows are deliberately NOT resolved here. Cutting needs no
 * measurement, while what is left standing on screen needs a language's glyph
 * widths, so that is `resolveInherited`'s job and this stays pure structure.
 */
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
