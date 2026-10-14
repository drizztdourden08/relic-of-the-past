/* @layer renderer-components @kind logic */
import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import type { Transaction } from '@tiptap/pm/state';
import type { Node as PmNode } from '@tiptap/pm/model';
import { editorRuntime } from '../editor-runtime';
import { DIALOGUE_LINE_TYPE } from '../line-attrs';
import { renumberKey } from './renumber-key';
import { renumberLines } from './renumber-lines';
import type { DialogueLine } from './renumber.type';

const linesOf = (doc: PmNode): DialogueLine[] => {
  const lines: DialogueLine[] = [];
  doc.forEach((node, offset) => {
    if (node.type.name === DIALOGUE_LINE_TYPE) lines.push({ node, pos: offset });
  });
  return lines;
};

const firstStructuralChange = (before: PmNode, after: PmNode): number | null => {
  const old = linesOf(before);
  const now = linesOf(after);
  const shared = Math.min(old.length, now.length);
  for (const [i, line] of old.slice(0, shared).entries()) {
    const other = now[i];
    if (other === undefined) throw new Error('the new document has fewer lines than the shared count');
    const a = line.node.attrs;
    const b = other.node.attrs;
    if (a.advanceKind !== b.advanceKind || a.advanceRow !== b.advanceRow || a.endsBox !== b.endsBox) {
      return i;
    }
  }
  return old.length === now.length ? null : shared;
};

const wantsRenumber = (transactions: readonly Transaction[]): boolean =>
  transactions.some((t) => t.docChanged)
  && !transactions.some((t) => t.getMeta(renumberKey) === true)
  && editorRuntime.mode !== 'off';

const renumberPlugin = () => new Plugin({
  key: renumberKey,
  appendTransaction: (transactions, oldState, newState) => {
    if (!wantsRenumber(transactions)) return null;

    const changedAt = firstStructuralChange(oldState.doc, newState.doc);
    if (changedAt === null) return null;

    const tr = newState.tr;
    if (!renumberLines(tr, linesOf(newState.doc), changedAt)) return null;
    tr.setMeta(renumberKey, true);
    return tr;
  },
});

const Renumber = Extension.create({
  name: 'dialogueRenumber',
  addProseMirrorPlugins: () => [renumberPlugin()],
});

export { Renumber };
