/* @layer renderer-components @kind logic */
import { Paragraph } from '@tiptap/extension-paragraph';
import { chainCommands } from '@tiptap/pm/commands';
import { keymap } from '@tiptap/pm/keymap';
import { lineNodeView } from './line-node-view';
import { deleteMergedPairBackward, deleteMergedPairForward } from './delete-merged-pair';
import { mergeLineBackward, mergeLineForward } from './merge-lines';
import { splitLine } from './split-line';
import { stepCaretLeft, stepCaretRight } from './step-caret';
import { toggleWaitHere } from './toggle-wait';
import { KEYMAP_PRIORITY } from './line-paragraph.constants';

const renderIf = (dataName: string, value: unknown): Record<string, string> => (
  value === null || value === undefined || value === false ? {} : { [dataName]: String(value) }
);

const advanceKindAttr = {
  default: null,
  parseHTML: (element: HTMLElement) => element.getAttribute('data-advance'),
  renderHTML: (attributes: Record<string, unknown>) => renderIf('data-advance', attributes.advanceKind),
};

const advanceRowAttr = {
  default: null,
  parseHTML: (element: HTMLElement) => element.getAttribute('data-advance-row'),
  renderHTML: (attributes: Record<string, unknown>) => renderIf('data-advance-row', attributes.advanceRow),
};

const endsBoxAttr = {
  default: false,
  parseHTML: (element: HTMLElement) => element.getAttribute('data-ends-box') === 'true',
  renderHTML: (attributes: Record<string, unknown>) => (
    attributes.endsBox === true ? { 'data-ends-box': 'true' } : {}
  ),
};

const DialogueLine = Paragraph.extend({
  priority: KEYMAP_PRIORITY,

  addAttributes: () => ({
    advanceKind: advanceKindAttr,
    advanceRow: advanceRowAttr,
    endsBox: endsBoxAttr,
  }),

  addNodeView: () => ({ node }) => lineNodeView(node),

  addProseMirrorPlugins: () => [
    keymap({
      'Enter': splitLine,
      'Shift-Enter': splitLine,
      'Mod-Enter': toggleWaitHere,
      'Backspace': chainCommands(deleteMergedPairBackward, mergeLineBackward),
      'Delete': chainCommands(deleteMergedPairForward, mergeLineForward),
      'ArrowRight': stepCaretRight,
      'ArrowLeft': stepCaretLeft,
    }),
  ],
});

export { DialogueLine };
