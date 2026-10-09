/* @layer shared-game @kind logic */
import type { Token } from '../../types';
import type { GlyphMetrics } from '../types';
import { glyphIndexOf, matchGlyphs } from '../glyph-metrics';
import type { LayoutPlan } from '../layout-plan';
import type { Pen, TokenEffect } from './box-pen.type';
import { SCROLL_COMMAND, WAIT_COMMAND } from './box-pen.constants';
import { drawGlyphs } from './draw-glyphs';
import { jumpTo } from './jump-to';
import { scroll } from './scroll';

const writeText = (pen: Pen, text: string, metrics: GlyphMetrics): void => {
  if (text.length === 0) return;
  const { glyphs, unmatched } = matchGlyphs(text, metrics);
  pen.unmatched.push(...unmatched);
  drawGlyphs(pen, glyphs, metrics);
};

const glyphForName = (name: string, metrics: GlyphMetrics): number | null => {
  const match = glyphIndexOf(`[${name}]`, 0, metrics);
  return match !== null && match.length === name.length + 2 ? match.index : null;
};

const applyCmd = (pen: Pen, name: string, param: number | undefined, plan: LayoutPlan): TokenEffect => {
  if (param !== undefined) return 'none';

  const glyph = glyphForName(name, plan.metrics);
  if (glyph !== null) {
    drawGlyphs(pen, [glyph], plan.metrics);
    return 'none';
  }

  if (name === SCROLL_COMMAND) scroll(pen);
  return name === WAIT_COMMAND ? 'wait' : 'none';
};

const applyToken = (pen: Pen, token: Token, plan: LayoutPlan): TokenEffect => {
  if (token.t === 'text') {
    writeText(pen, token.v, plan.metrics);
    return 'none';
  }
  if (token.t === 'break') {
    jumpTo(pen, token.row);
    return 'none';
  }
  if (token.t === 'var') {
    if (token.name === 'number') drawGlyphs(pen, [plan.numberGlyph], plan.metrics);
    else {
      pen.unmatched.push(...plan.nameUnmatched);
      drawGlyphs(pen, plan.nameGlyphs, plan.metrics);
    }
    return 'none';
  }
  if (token.t === 'cmd') return applyCmd(pen, token.name, token.param, plan);

  throw new Error(
    `measure: unresolved glossary reference "${token.key}". `
    + 'Run resolveRefs on the token stream before measuring it.',
  );
};

export { applyToken };
