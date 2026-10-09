/* @layer renderer-components @kind logic */
import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { ROWS_PER_BOX } from '@rotp/languages';
import type { LineAdvance } from '@rotp/languages';
import type { Node as PmNode } from '@tiptap/pm/model';
import { editorRuntime } from '../editor-runtime';
import { rowOfAdvance } from '../line-shape';
import { advanceOfAttrs, attrsForLine, DIALOGUE_LINE_TYPE, endsBoxOfAttrs } from '../line-attrs';
import { renumberKey } from './renumber-key';

const nextAdvance = (previousRow: number): LineAdvance => (
  previousRow < ROWS_PER_BOX
    ? { kind: 'row', row: (previousRow + 1) as 1 | 2 | 3 }
    : { kind: 'scroll' }
);

const linesOf = (doc: PmNode): { node: PmNode; pos: number }[] => {
  const lines: { node: PmNode; pos: number }[] = [];
  doc.forEach((node, offset) => {
    if (node.type.name === DIALOGUE_LINE_TYPE) lines.push({ node, pos: offset });
  });
  return lines;
};

const firstStructuralChange = (before: PmNode, after: PmNode): number | null => {
  const old = linesOf(before);
  const now = linesOf(after);
  const shared = Math.min(old.length, now.length);
  for (let i = 0; i < shared; i += 1) {
    const a = old[i].node.attrs;
    const b = now[i].node.attrs;
    if (a.advanceKind !== b.advanceKind || a.advanceRow !== b.advanceRow || a.endsBox !== b.endsBox) {
      return i;
    }
  }
  return old.length === now.length ? null : shared;
};

const renumberPlugin = () => new Plugin({
  key: renumberKey,
  appendTransaction: (transactions, oldState, newState) => {
    if (!transactions.some((t) => t.docChanged)) return null;
    if (transactions.some((t) => t.getMeta(renumberKey) === true)) return null;
    if (editorRuntime.mode === 'off') return null;

    const changedAt = firstStructuralChange(oldState.doc, newState.doc);
    if (changedAt === null) return null;

    const lines = linesOf(newState.doc);
    const tr = newState.tr;
    let touched = false;
    let previousRow = 0;

    for (let i = 0; i < lines.length; i += 1) {
      const { node, pos } = lines[i];
      if (i <= changedAt) {
        previousRow = rowOfAdvance(advanceOfAttrs(node.attrs));
        continue;
      }
      const expected = nextAdvance(previousRow);
      const current = advanceOfAttrs(node.attrs);
      const differs = (expected?.kind ?? null) !== (current?.kind ?? null)
        || (expected?.kind === 'row' && current?.kind === 'row' && expected.row !== current.row);
      if (differs) {
        tr.setNodeMarkup(pos, undefined, {
          ...attrsForLine(expected, endsBoxOfAttrs(node.attrs)),
        });
        touched = true;
      }
      previousRow = rowOfAdvance(expected);
      if (editorRuntime.mode === 'block' && endsBoxOfAttrs(node.attrs)) break;
    }

    if (!touched) return null;
    tr.setMeta(renumberKey, true);
    return tr;
  },
});

const Renumber = Extension.create({
  name: 'dialogueRenumber',
  addProseMirrorPlugins: () => [renumberPlugin()],
});

export { Renumber };
