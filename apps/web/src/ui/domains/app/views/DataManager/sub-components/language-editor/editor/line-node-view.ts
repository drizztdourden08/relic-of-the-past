/* @layer renderer-components @kind logic */
/**
 * How one line is drawn: its row information and its text, as ONE element.
 *
 * The gutter — the row the line lands on, the pixels its characters take, the
 * pixels left before the row's edge — is a child of the same paragraph that
 * holds the text, so the two cannot be laid out apart: there is no second
 * column to drift, and nothing to align. It is re-painted from the line's own
 * node every time the node changes, which is every keystroke in that line and
 * nothing else.
 *
 * The gutter is outside the editable content and outside the document: the
 * caret cannot enter it, a copy cannot carry it, and a mutation inside it is
 * never mistaken for typing.
 */
import { lineMetrics, ROW_WIDTH_PX } from '@shared/game/language';
import type { Node as PmNode } from '@tiptap/pm/model';
import type { NodeView } from '@tiptap/pm/view';
import { editorRuntime } from './editor-runtime';
import { measurableGlossary } from './line-shape';
import { tokensOfLine } from './line-tokens';

/** The data attributes the stylesheet and the marker plugin read off a line. */
const applyLineAttrs = (dom: HTMLElement, attrs: Record<string, unknown>): void => {
  const set = (name: string, value: unknown) => {
    if (value === null || value === undefined || value === false) dom.removeAttribute(name);
    else dom.setAttribute(name, String(value));
  };
  set('data-advance', attrs.advanceKind);
  set('data-advance-row', attrs.advanceRow);
  set('data-ends-box', attrs.endsBox === true ? 'true' : null);
};

const cell = (className: string): HTMLSpanElement => {
  const span = document.createElement('span');
  span.className = className;
  return span;
};

const GUTTER_CLASS = 'line-gutter';

const buildGutter = (): HTMLSpanElement => {
  const root = cell(GUTTER_CLASS);
  root.contentEditable = 'false';
  root.setAttribute('aria-hidden', 'true');
  const meter = cell('line-gutter__meter');
  meter.append(cell('line-gutter__fill'));
  root.append(cell('line-gutter__num'), meter, cell('line-gutter__px'), cell('line-gutter__ch'));
  return root;
};

/** How many characters the line holds — atoms count as one, like the caret steps. */
const countOf = (tokens: ReturnType<typeof tokensOfLine>): number =>
  tokens.reduce((sum, token) => sum + (token.t === 'text' ? token.v.length : 1), 0);

/** The meter reads as tight from here up, matching the list's fit chips. */
const TIGHT_FROM = 0.85;

/**
 * (Re)paints one line's gutter from the line's node: the line number, a meter
 * of the row's 168px filled so far, the pixels left, and the character count.
 * Exported so the refresh plugin can drive every gutter from the editor state
 * after each transaction — the one source that is correct no matter how the
 * change arrived. The line number comes from that walk too (a node cannot know
 * its own position), so the node view paints with it unknown and the refresh
 * that follows every update fills it in.
 */
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

const lineNodeView = (node: PmNode): NodeView => {
  const dom = document.createElement('p');
  const gutter = buildGutter();
  const content = cell('line-content');
  dom.append(gutter, content);

  const apply = (next: PmNode): void => {
    applyLineAttrs(dom, next.attrs);
    paintGutter(gutter, next, null);
  };
  apply(node);

  return {
    dom,
    contentDOM: content,
    update: (next: PmNode) => {
      if (next.type !== node.type) return false;
      apply(next);
      return true;
    },
    // Repainting the gutter is our own DOM work, never an edit to parse back.
    ignoreMutation: (mutation) => gutter.contains(mutation.target),
  };
};

export { lineNodeView, paintGutter, GUTTER_CLASS };
