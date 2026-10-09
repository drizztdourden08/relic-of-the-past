/* @layer renderer-components @kind logic */
import { lineMetrics, ROW_WIDTH_PX } from '@shared/game/language';
import type { Node as PmNode } from '@tiptap/pm/model';
import { editorRuntime } from '../editor-runtime';
import { measurableGlossary } from '../line-shape';
import { tokensOfLine } from '../line-tokens';
import { TIGHT_FROM } from './line-node-view.constants';

const countOf = (tokens: ReturnType<typeof tokensOfLine>): number =>
  tokens.reduce((sum, token) => sum + (token.t === 'text' ? token.v.length : 1), 0);

const paintGutter = (root: HTMLElement, node: PmNode, lineNo: number | null): void => {
  const [num, meter, px, ch] = Array.from(root.children) as HTMLElement[];
  const fill = meter.firstElementChild as HTMLElement;
  const { metrics, glossary } = editorRuntime;

  if (lineNo !== null) num.textContent = String(lineNo);

  const tokens = tokensOfLine(node);
  ch.textContent = `${countOf(tokens)} ch`;

  if (metrics === null) {
    px.textContent = '';
    fill.style.width = '0%';
    root.classList.remove('line-gutter--over', 'line-gutter--tight');
    return;
  }
  const { widthPx } = lineMetrics(tokens, metrics, measurableGlossary(tokens, glossary));
  const free = ROW_WIDTH_PX - widthPx;
  const share = widthPx / ROW_WIDTH_PX;
  fill.style.width = `${Math.min(100, Math.round(share * 100))}%`;
  px.textContent = free < 0 ? `${-free} over` : `${free} px`;
  root.classList.toggle('line-gutter--over', free < 0);
  root.classList.toggle('line-gutter--tight', free >= 0 && share >= TIGHT_FROM);
};

export { paintGutter };
