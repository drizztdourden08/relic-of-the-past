/* @layer renderer-components @kind logic */
/**
 * Gives every character in the EDITABLE line its real advance, so the row's edge
 * rule and the gutter's figures describe the same line.
 *
 * The typing face bills one fixed cell per character while the game's font
 * advances 1 to 8 pixels per glyph, which overstated a typical line by about a
 * third: text appeared to run past the 21-cell ruler while the gutter — reading
 * the pack's own width table — reported room to spare. One of the two had to
 * move, and the width table is the source of truth.
 *
 * It is done with INLINE DECORATIONS rather than by putting anything in the
 * document: the decoration wraps a range in a span of its own, so the text a
 * translator types, copies and saves is untouched and nothing new can be typed
 * into existence. Only the open entry is decorated, so the cost is one entry's
 * characters however large the set is.
 *
 * The advance is written as game pixels times the shared scale, the same way the
 * read-only card does it, so both sides of the panel scale together and the raw
 * pixel numbers stay where they belong.
 *
 * A character the alphabet cannot spell keeps the face's own advance and is
 * called out instead — it is the reason a line will not encode, so it must be
 * visible rather than quietly measured as nothing.
 */
import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { charCells } from './char-cells';
import type { EditorState } from '@tiptap/pm/state';
import type { GlyphFontHandle } from './editor-ui.type';

/** Marks a cell as measured, and says what it was billed — the probe reads it. */
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

/**
 * The extension is built with the font as a HANDLE, not a value: the pack's
 * bytes are read from disk after the editor exists, so a font captured here
 * would be the null it was at that moment. Reading `current` while the
 * decorations are computed is what lets the widths arrive late.
 */
const charAdvance = (font: GlyphFontHandle) => Extension.create({
  name: 'charAdvance',

  addProseMirrorPlugins: () => [
    new Plugin({ props: { decorations: (state) => decorationsFor(state, font) } }),
  ],
});

export { charAdvance };
