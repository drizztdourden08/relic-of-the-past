/* @layer renderer-components @kind logic */
import { lineMetrics } from '@rotp/languages';
import type { DialogueLineView, GlossaryTerm, GlyphMetrics } from '@rotp/languages';
import { rowOfAdvance } from './row-of-advance';
import { measurableGlossary } from './measurable-glossary';
import type { LineShape } from './line-shape.type';

const viewOfShape = (
  shape: LineShape,
  index: number,
  box: number,
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
): DialogueLineView => ({
  index,
  box,
  row: rowOfAdvance(shape.advance),
  advance: shape.advance,
  tokens: shape.tokens,
  endsBox: shape.endsBox,
  ...lineMetrics(shape.tokens, metrics, measurableGlossary(shape.tokens, glossary)),
});

export { viewOfShape };
