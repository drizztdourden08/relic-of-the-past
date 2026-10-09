/* @layer renderer-components @kind logic */
import type { Node as PmNode } from '@tiptap/pm/model';
import type { NodeView } from '@tiptap/pm/view';
import { cell } from './cell';
import { paintGutter } from './paint-gutter';
import { GUTTER_CLASS } from './line-node-view.constants';

const applyLineAttrs = (dom: HTMLElement, attrs: Record<string, unknown>): void => {
  const set = (name: string, value: unknown) => {
    if (value === null || value === undefined || value === false) dom.removeAttribute(name);
    else dom.setAttribute(name, String(value));
  };
  set('data-advance', attrs.advanceKind);
  set('data-advance-row', attrs.advanceRow);
  set('data-ends-box', attrs.endsBox === true ? 'true' : null);
};

const buildGutter = (): HTMLSpanElement => {
  const root = cell(GUTTER_CLASS);
  root.contentEditable = 'false';
  root.setAttribute('aria-hidden', 'true');
  const meter = cell('line-gutter__meter');
  meter.append(cell('line-gutter__fill'));
  root.append(cell('line-gutter__num'), meter, cell('line-gutter__px'), cell('line-gutter__ch'));
  return root;
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
    ignoreMutation: (mutation) => gutter.contains(mutation.target),
  };
};

export { lineNodeView };
