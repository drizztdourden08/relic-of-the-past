/* @layer shared-game @kind logic */
import { resolveRefs } from '../glossary/resolve-refs';
import type { GlossaryTerm } from '../types';
import { applyToken, createPen, visibleRows } from '../layout/box-pen';
import type { LayoutOptions } from '../layout/layout-plan';
import { layoutPlan } from '../layout/layout-plan';
import type { GlyphMetrics } from '../layout/types';
import { joinLines } from '../lines/join-lines';
import type { Block, BlockDoc } from './types';

const resolveInherited = (
  doc: BlockDoc,
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
  opts?: LayoutOptions,
): BlockDoc => {
  const plan = layoutPlan(metrics, opts);
  const pen = createPen({ blankOnJump: false });

  const blocks = doc.blocks.map((block): Block => {
    const inheritedBeforeDrawing = visibleRows(pen);

    for (const token of resolveRefs(joinLines(block.lines), glossary)) {
      applyToken(pen, token, plan);
    }

    return { ...block, inherited: inheritedBeforeDrawing };
  });

  return { blocks };
};

export { resolveInherited };
