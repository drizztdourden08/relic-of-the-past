/* @layer renderer-components @kind logic */
/**
 * Row codes follow the lines — the author never renumbers anything.
 *
 * When a line is opened, wrapped in, or removed, every line after it has
 * genuinely moved, so its advance code is re-derived: rows fill downward, and
 * once the bottom row is taken the box scrolls. A wait is ignored by the
 * derivation on purpose — the engine clears nothing at a wait, so continuing
 * downward (and scrolling from the bottom row) is the one continuation that
 * draws cleanly over what is already on screen. That is also the vanilla
 * corpus's own idiom: scrolls outnumber row-one returns thirty-five to one.
 *
 * Reach follows the automation mode. Continuous renumbers to the end of the
 * entry; in-block stops where the changed line's box ends; off renumbers
 * nothing (a line created by a wrap still gets its own derived code at
 * creation). Lines BEFORE the change are never touched, which is what keeps an
 * untouched entry serialising byte-for-byte.
 */
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { ROWS_PER_BOX } from '@shared/game/language';
import type { LineAdvance } from '@shared/game/language';
import type { Node as PmNode } from '@tiptap/pm/model';
import { editorRuntime } from './editor-runtime';
import { rowOfAdvance } from './line-shape';
import { advanceOfAttrs, attrsForLine, DIALOGUE_LINE_TYPE, endsBoxOfAttrs } from './line-attrs';

const renumberKey = new PluginKey('dialogueRenumber');

/** The pen keeps moving down; a full box scrolls. Waits do not reset it. */
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

/** Index of the first line whose structure differs between two documents. */
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
      // In-block automation stops once the changed line's box has closed.
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

export { Renumber, renumberKey };
