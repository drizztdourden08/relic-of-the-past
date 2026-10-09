/* @layer renderer-components @kind logic */
import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { charCells } from './char-cells';
import type { EditorState } from '@tiptap/pm/state';
import type { GlyphFontHandle } from './editor-ui.type';

const kAdvanceAttr = 'data-advance-px';

const cellAttrs = (widthPx: number | null): Record<string, string> => (
  widthPx === null
    ? { nodeName: 'span', class: 'dialogue-editor__cell dialogue-editor__cell--unknown' }
    : {
      nodeName: 'span',
      class: 'dialogue-editor__cell',
      style: `width:calc(${widthPx} * var(--game-scale) * 1px)`,
      [kAdvanceAttr]: String(widthPx),
    }
);

const decorationsFor = (state: EditorState, font: GlyphFontHandle): DecorationSet => {
  const decorations: Decoration[] = [];

  state.doc.descendants((node, pos) => {
    if (!node.isText || node.text === undefined) return true;
    for (const cell of charCells(node.text, font.current.metrics)) {
      const from = pos + cell.at;
      decorations.push(Decoration.inline(from, from + cell.length, cellAttrs(cell.widthPx)));
    }
    return true;
  });

  return DecorationSet.create(state.doc, decorations);
};

const charAdvance = (font: GlyphFontHandle) => Extension.create({
  name: 'charAdvance',

  addProseMirrorPlugins: () => [
    new Plugin({ props: { decorations: (state) => decorationsFor(state, font) } }),
  ],
});

export { charAdvance };
