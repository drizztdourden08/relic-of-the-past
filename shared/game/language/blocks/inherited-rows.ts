/* @layer shared-game @kind logic */
/**
 * What is still on screen when each block begins.
 *
 * The pixel buffer is cleared exactly once per message and no handler clears it
 * again, so a block inherits the surviving rows of every block before it. Only
 * two things ever remove one:
 *
 * - A SCROLL shifts the box up a line: the top row falls off for good, the other
 *   rows move up one, a blank row arrives at the bottom, and the pen parks on
 *   that bottom row. Inherit after a scroll chain and the rows come back shifted,
 *   not reset.
 * - Reaching the end of the message. A wait removes nothing.
 *
 * A ROW MARKER removes nothing either — it only moves the pen to that row's left
 * edge. That is the one place this walk cannot use the default pen: `measureRows`
 * runs it with `blankOnJump: true`, treating the landing row as empty so a fresh
 * run is sized without an earlier run's leftovers being charged to it. That is a
 * measurement convention and its widths are relied on, so it stays exactly as it
 * is; a faithful screen needs the opposite, and asks the pen for it here. The two
 * conventions are written out in full in `layout/box-pen.ts`.
 *
 * The walk replays each block's own tokens (`joinLines`) through the shared pen
 * rather than re-reading the line views, so there is one layout engine and the
 * row a line lands on is the engine's answer, not the editor's. Those two differ
 * in one authored case: a line carrying no code of its own after a wait is
 * numbered row 1 by box convention, while the engine leaves the pen wherever the
 * previous block left it, and the rows here follow the engine.
 */
import { resolveRefs } from '../glossary/resolve-refs';
import type { GlossaryTerm } from '../types';
import { applyToken, createPen, visibleRows } from '../layout/box-pen';
import type { LayoutOptions } from '../layout/layout-plan';
import { layoutPlan } from '../layout/layout-plan';
import type { GlyphMetrics } from '../layout/types';
import { joinLines } from '../lines/join-lines';
import type { Block, BlockDoc } from './types';

/** Fill in every block's `inherited`, leaving the blocks otherwise untouched. */
const resolveInherited = (
  doc: BlockDoc,
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
  opts?: LayoutOptions,
): BlockDoc => {
  const plan = layoutPlan(metrics, opts);
  const pen = createPen({ blankOnJump: false });

  const blocks = doc.blocks.map((block): Block => {
    // Read before the block draws anything: what it inherits is the screen its
    // predecessors left, and the first block inherits a cleared buffer.
    const inherited = visibleRows(pen);

    for (const token of resolveRefs(joinLines(block.lines), glossary)) {
      applyToken(pen, token, plan);
    }

    return { ...block, inherited };
  });

  return { blocks };
};

export { resolveInherited };
