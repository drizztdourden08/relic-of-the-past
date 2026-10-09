/* @layer shared-game @kind logic */
import { ROW_WIDTH_PX } from '../layout/types';
import { lineMetrics } from '../lines/line-metrics';
import type { Token } from '../types';
import type { LineBreak, StructureContext } from './types';

const kSpace = ' ';

const textToken = (v: string): Token[] => (v.length === 0 ? [] : [{ t: 'text', v }]);

const candidatesOf = (tokens: Token[]): LineBreak[] => {
  const found: LineBreak[] = [];

  tokens.forEach((token, at) => {
    if (token.t !== 'text') return;

    for (let space = token.v.indexOf(kSpace); space >= 0; space = token.v.indexOf(kSpace, space + 1)) {
      found.push({
        head: [...tokens.slice(0, at), ...textToken(token.v.slice(0, space))],
        tail: [...textToken(token.v.slice(space + 1)), ...tokens.slice(at + 1)],
      });
    }
  });

  return found;
};

const breakLine = (tokens: Token[], ctx: StructureContext): LineBreak | null => {
  const { metrics, glossary } = ctx;
  let best: LineBreak | null = null;

  for (const candidate of candidatesOf(tokens)) {
    if (candidate.head.length === 0) continue;
    if (lineMetrics(candidate.head, metrics, glossary).widthPx > ROW_WIDTH_PX) break;
    best = candidate;
  }

  return best;
};

export { breakLine };
