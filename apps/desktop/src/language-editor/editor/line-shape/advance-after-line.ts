/* @layer renderer-components @kind logic */
import { advanceForNewLine } from '@rotp/languages';
import type { LineAdvance } from '@rotp/languages';
import { rowOfAdvance } from './row-of-advance';
import type { LineShape } from './line-shape.type';

const advanceAfterLine = (shape: LineShape): LineAdvance => advanceForNewLine({
  index: 0,
  box: 0,
  row: rowOfAdvance(shape.advance),
  advance: shape.advance,
  tokens: shape.tokens,
  endsBox: shape.endsBox,
  widthPx: 0,
  count: 0,
  overflow: false,
  freePx: 0,
});

export { advanceAfterLine };
