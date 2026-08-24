/* @layer renderer-components @kind logic */
/**
 * The block a line occupies: an ordinary paragraph that also remembers which
 * code put the pen on its row and whether a wait follows it.
 *
 * The keys are bound as a plain ProseMirror keymap rather than through the
 * editor framework's shortcut layer, for one reason: each of these commands
 * builds and dispatches its own transaction, and the framework's wrapper
 * dispatches a transaction of its own around whatever a handler does, which
 * would apply the edit twice. A keymap plugin hands the command the state and
 * the dispatcher directly, which is exactly the contract the commands are
 * written to.
 *
 * The priority is raised so this keymap is consulted before the editor's base
 * bindings. Enter must not fall through to the generic block split, which would
 * make a paragraph with default attributes — a line with no advance code in the
 * middle of an entry, which the engine has no way to draw.
 *
 * The two bare arrows are taken for the same reason in reverse: left to the
 * browser they step by DOM position, and a line has more of those than it has
 * characters (see `step-caret.ts`). Shift with an arrow, word jumps and the
 * vertical arrows are deliberately not bound.
 */
import { Paragraph } from '@tiptap/extension-paragraph';
import { chainCommands } from '@tiptap/pm/commands';
import { keymap } from '@tiptap/pm/keymap';
import { lineNodeView } from './line-node-view';
import { deleteMergedPairBackward, deleteMergedPairForward } from './delete-merged-pair';
import { mergeLineBackward, mergeLineForward } from './merge-lines';
import { splitLine } from './split-line';
import { stepCaretLeft, stepCaretRight } from './step-caret';
import { toggleWaitHere } from './toggle-wait';

/** Ahead of the base keymap, which would otherwise claim Enter first. */
const kKeymapPriority = 1000;

/** Absent fields are left off the element rather than written as "null". */
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

/**
 * Written to the element only when true, which is what the stylesheet reads to
 * group the lines of one box: the line AFTER a `data-ends-box` one starts the
 * next box, so the grouping needs no second source of truth.
 */
const endsBoxAttr = {
  default: false,
  parseHTML: (element: HTMLElement) => element.getAttribute('data-ends-box') === 'true',
  renderHTML: (attributes: Record<string, unknown>) => (
    attributes.endsBox === true ? { 'data-ends-box': 'true' } : {}
  ),
};

const DialogueLine = Paragraph.extend({
  priority: kKeymapPriority,

  addAttributes: () => ({
    advanceKind: advanceKindAttr,
    advanceRow: advanceRowAttr,
    endsBox: endsBoxAttr,
  }),

  // The line draws its own row gutter beside its text — see line-node-view.ts.
  addNodeView: () => ({ node }) => lineNodeView(node),

  addProseMirrorPlugins: () => [
    keymap({
      'Enter': splitLine,
      'Shift-Enter': splitLine,
      'Mod-Enter': toggleWaitHere,
      // A merged picture goes first: it is one character, so one press takes both
      // of its halves. Declining falls through to the line merge, then to the
      // base keymap's ordinary delete.
      'Backspace': chainCommands(deleteMergedPairBackward, mergeLineBackward),
      'Delete': chainCommands(deleteMergedPairForward, mergeLineForward),
      'ArrowRight': stepCaretRight,
      'ArrowLeft': stepCaretLeft,
    }),
  ],
});

export { DialogueLine };
