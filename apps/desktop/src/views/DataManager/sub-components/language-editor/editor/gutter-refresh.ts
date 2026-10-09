/* @layer renderer-components @kind logic */
import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { GUTTER_CLASS, paintGutter } from './line-node-view';
import { DIALOGUE_LINE_TYPE } from './line-attrs';
import type { EditorView } from '@tiptap/pm/view';

const repaintAll = (view: EditorView): void => {
  let lineNo = 0;
  view.state.doc.forEach((node, offset) => {
    if (node.type.name !== DIALOGUE_LINE_TYPE) return;
    lineNo += 1;
    const dom = view.nodeDOM(offset);
    if (!(dom instanceof HTMLElement)) return;
    const gutter = dom.querySelector(`:scope > .${GUTTER_CLASS}`);
    if (gutter instanceof HTMLElement) paintGutter(gutter, node, lineNo);
  });
};

const GutterRefresh = Extension.create({
  name: 'dialogueGutterRefresh',

  addProseMirrorPlugins: () => [
    new Plugin({
      view: (initial) => {
        repaintAll(initial);
        return { update: repaintAll };
      },
    }),
  ],
});

export { GutterRefresh };
