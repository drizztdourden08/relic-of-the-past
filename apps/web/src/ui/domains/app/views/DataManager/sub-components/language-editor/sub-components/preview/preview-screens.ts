/* @layer renderer-components @kind logic */
/**
 * What the player actually sees, box by box.
 *
 * The engine clears the message's pixel buffer EXACTLY ONCE, when the message
 * opens, and no later handler clears it again, not at a wait and not at a row
 * marker. So a box is never a blank slate: it is whatever the boxes before it
 * left standing, with this box's own rows painted over the top. A preview that
 * redraws each box from its own text alone is not the game. It is the one thing
 * this view exists to stop someone believing.
 *
 * `resolveInherited` already answers that question. It walks the whole message
 * through the shared pen in the ENGINE's mode and reports, per box, the rows
 * still on screen when that box begins. Which means the rows on screen while the
 * player reads box N are the rows the NEXT box inherits. So the walk is run over
 * the blocks plus one empty sentinel: every real box then has a successor to read
 * its finished screen off, including the last, and no second layout engine is
 * written here.
 *
 * A row is marked CARRIED when the same pixels were already standing before this
 * box drew anything. That is what makes the difference visible: a box whose own
 * text is one line but whose screen shows three is exactly the case authored data
 * is full of, and the two lines it did not write should not look like its own.
 */
import { resolveInherited } from '@shared/game/language';
import { choiceOf } from './choice-of';
import type { Block, BlockDoc, GlossaryTerm, GlyphMetrics, LayoutOptions, RowFit } from '@shared/game/language';
import type { PreviewChoice } from './choice-of';

/** One row of a previewed box. */
type PreviewRow = RowFit & {
  /** These pixels were already on screen before this box drew. */
  carried: boolean;
};

/** One box as the player meets it. */
type PreviewScreen = {
  /** 0-based, matching the block it draws. */
  index: number;
  ends: Block['ends'];
  rows: PreviewRow[];
  /** The choice prompt this box shows, when one of its tokens declares one. */
  choice: PreviewChoice | null;
};

/** An empty block, so the last real one has a successor to read its screen from. */
const sentinel = (index: number): Block => ({
  index, lines: [], ends: 'message-end', inherited: [],
});

const sameGlyphs = (left: number[], right: number[]): boolean =>
  left.length === right.length && left.every((glyph, at) => glyph === right[at]);

const wasStanding = (before: RowFit[], row: RowFit): boolean =>
  before.some((earlier) => sameGlyphs(earlier.glyphs, row.glyphs));

type ScreenParams = {
  doc: BlockDoc;
  metrics: GlyphMetrics;
  /** Every variable carrying literal text, so a reference can be expanded. */
  terms: GlossaryTerm[];
  /** Concrete samples for the engine's own substitutions. */
  opts?: LayoutOptions;
};

/**
 * The message as screens. Empty when the entry holds a reference the set cannot
 * expand. The expansion refuses loudly instead of drawing a lie, and the caller
 * shows the validation problem.
 */
const previewScreens = (params: ScreenParams): PreviewScreen[] => {
  const { doc, metrics, terms, opts } = params;
  if (doc.blocks.length === 0) return [];

  const probe: BlockDoc = { blocks: [...doc.blocks, sentinel(doc.blocks.length)] };

  try {
    const walked = resolveInherited(probe, metrics, terms, opts);
    return doc.blocks.map((block, at) => {
      const before = walked.blocks[at].inherited;
      const shown = walked.blocks[at + 1].inherited;
      return {
        index: at,
        ends: block.ends,
        rows: shown.map((row) => ({ ...row, carried: wasStanding(before, row) })),
        choice: choiceOf(block),
      };
    });
  } catch {
    return [];
  }
};

export { previewScreens };
export type { PreviewRow, PreviewScreen };
