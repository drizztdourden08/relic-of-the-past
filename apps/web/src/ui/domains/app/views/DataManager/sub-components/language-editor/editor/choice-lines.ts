/* @layer renderer-components @kind logic */
/**
 * Choice options are edited where they live: inside the editor, as the lines
 * they are.
 *
 * A choice prompt stores its option text as the LAST lines of the entry, one
 * option per line, with the prompt code as the stream's final token. That was
 * verified against every prompt in the vanilla corpus. So the options need no
 * second editing surface: this plugin finds the prompt code in the document,
 * marks the option lines, and the stylesheet dresses them as the selectable
 * rows the player will see. Typing in one is typing in the entry; every editor
 * behavior (wrapping, measuring, undo) applies unchanged.
 *
 * The decoration carries the option's 1-based index, which the line's gutter
 * and the option tag both read.
 */
import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as PmNode } from '@tiptap/pm/model';
import { DIALOGUE_LINE_TYPE } from './line-attrs';
import { DIALOGUE_TOKEN_TYPE } from './token-attrs';

/** The prompt codes, and how many option lines each one reads. */
const OPTION_COUNTS: Record<string, number> = {
  Choose: 2, Choose2: 2, Choose3: 3, Selchg: 2,
};

/** How many options the document's prompt code declares; 0 without one. */
const optionCountOf = (doc: PmNode): number => {
  let count = 0;
  doc.descendants((node) => {
    if (node.type.name !== DIALOGUE_TOKEN_TYPE) return undefined;
    const declared = OPTION_COUNTS[String(node.attrs.name)];
    if (declared !== undefined) count = declared;
    return false;
  });
  return count;
};

const decorationsFor = (doc: PmNode): DecorationSet => {
  const count = optionCountOf(doc);
  if (count === 0) return DecorationSet.empty;

  const lines: { pos: number; node: PmNode }[] = [];
  doc.forEach((node, offset) => {
    if (node.type.name === DIALOGUE_LINE_TYPE) lines.push({ pos: offset, node });
  });
  if (lines.length < count) return DecorationSet.empty;

  const options = lines.slice(lines.length - count);
  return DecorationSet.create(doc, options.map((line, at) => Decoration.node(
    line.pos,
    line.pos + line.node.nodeSize,
    { class: 'line--option', 'data-option': String(at + 1) },
  )));
};

const ChoiceLines = Extension.create({
  name: 'dialogueChoiceLines',

  addProseMirrorPlugins: () => [
    new Plugin({
      props: { decorations: (state) => decorationsFor(state.doc) },
    }),
  ],
});

export { ChoiceLines };
