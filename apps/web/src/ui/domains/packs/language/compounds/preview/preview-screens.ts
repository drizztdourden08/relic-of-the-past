/* @layer renderer-components @kind logic */
import { resolveInherited } from '@shared/game/language';
import { choiceOf } from './choice-of';
import type { Block, BlockDoc, RowFit } from '@shared/game/language';
import type { PreviewScreen, ScreenParams } from './preview.type';

const emptySentinelBlock = (index: number): Block => ({
  index, lines: [], ends: 'message-end', inherited: [],
});

const sameGlyphs = (left: number[], right: number[]): boolean =>
  left.length === right.length && left.every((glyph, at) => glyph === right[at]);

const wasStanding = (before: RowFit[], row: RowFit): boolean =>
  before.some((earlier) => sameGlyphs(earlier.glyphs, row.glyphs));

const previewScreens = (params: ScreenParams): PreviewScreen[] => {
  const { doc, metrics, terms, opts } = params;
  if (doc.blocks.length === 0) return [];

  const probe: BlockDoc = { blocks: [...doc.blocks, emptySentinelBlock(doc.blocks.length)] };

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
