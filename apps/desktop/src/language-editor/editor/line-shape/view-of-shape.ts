/* @layer renderer-components @kind logic */
import { lineMetrics } from '@rotp/languages';
import type { DialogueLineView } from '@rotp/languages';
import { rowOfAdvance } from './row-of-advance';
import { measurableGlossary } from './measurable-glossary';
import type { ViewOfShapeParams } from './view-of-shape.type';

const viewOfShape = (params: ViewOfShapeParams): DialogueLineView => {
  const { shape, index, box, metrics, glossary } = params;
  return {
    index,
    box,
    row: rowOfAdvance(shape.advance),
    advance: shape.advance,
    tokens: shape.tokens,
    endsBox: shape.endsBox,
    ...lineMetrics(shape.tokens, metrics, measurableGlossary(shape.tokens, glossary)),
  };
};

export { viewOfShape };
