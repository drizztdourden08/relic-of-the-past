/* @layer renderer-components @kind logic */
import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as PmNode } from '@tiptap/pm/model';
import { DIALOGUE_LINE_TYPE } from './line-attrs';
import { DIALOGUE_TOKEN_TYPE } from './token-attrs';
import { OPTION_COUNTS } from './choice-lines.constants';

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
