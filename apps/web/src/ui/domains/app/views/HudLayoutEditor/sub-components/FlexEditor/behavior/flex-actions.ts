/* @layer renderer-components @kind logic */
/**
 * ONE TABLE, AND EVERY ROW IN IT IS AN ACTION ON THE SELECTION (§58). That is the
 * grid's rule, kept, because "same principle" is the whole of the brief:
 *
 * > "the flex should have a manipulation section as well. same principle"
 *
 * The toolbar, the legend and the keyboard all read these rows, so a legend can
 * never promise a shortcut the toolbar does not have.
 *
 * FOUR ACTIONS, AND THEY ARE THE FOUR A LINE OF TRACKS HAS. A flex container's
 * structure is the ORDER of its children. Each child is its own track, so the
 * things that can be done to a picked one are: earlier, later, to the start, to
 * the end. There is no insert and no remove here on purpose: a child is added by
 * the editor's toolbar and deleted from the outline, and a second door onto
 * either would be two writers for one edit.
 *
 * FOUR BUTTONS, ALWAYS, IN READING ORDER: start · earlier · later · end. A move
 * that cannot apply is DISABLED IN PLACE, never absent. Round 23 dropped them,
 * and the photograph showed why that is wrong: move the first of two children
 * later and `→ →|` became `← |←` in the same two spots, so a second press on
 * the same pixel undid the first. A button's position is part of its meaning.
 *
 * ONE PICKED CHILD, FOR THE MOVES. A multi-pick still names itself in the chip
 * and still echoes on the stage, but a run of children has no single place to
 * move to that is not a second design decision; it refuses in the legend rather
 * than guessing. The selection SHAPE is a run from day one for the same reason
 * `drop-intent.ts`'s `ids` is an array: the signature is the expensive half.
 *
 * THE ARROWS FOLLOW THE FLOW. A row's "earlier" is `←` and a column's is `↑`,
 * from the same `EARLIER_ICON`/`EARLIER_KEY` pair the grid's own track moves print,
 * keyed by the axis the children actually run along. The two END moves use the
 * `arrow-into-a-wall` family instead, because "one along" and "all the way"
 * drawn as the same arrow are two buttons nobody can tell apart (round 21).
 */
import {
  EARLIER_ICON, EARLIER_KEY, END_ICON, LATER_ICON, LATER_KEY, START_ICON,
} from '../../GridEditor/behavior/grid-icons';
import type { EditorAction, FlexActionContext, FlexSelection } from '../FlexEditor.type';

/** A flex container flows one way, so its "earlier" is the grid's `columns`
 *  arrow when it is a row and the `rows` arrow when it is a column. */
const axisOf = (direction: 'row' | 'column'): 'columns' | 'rows' =>
  (direction === 'row' ? 'columns' : 'rows');

/** The three pointer gestures, printed under every state. They write NOTHING.
 *  A click, a modifier click and a shift click all leave the document
 *  byte-identical; what they change is what the toolbar offers. */
const GESTURES: EditorAction[] = [
  { key: 'pick', kind: 'gesture', label: 'select', shortcut: { mouse: 'left' } },
  { key: 'add-to', kind: 'gesture', label: 'add', shortcut: { keys: ['{mod}'], mouse: 'left' } },
  { key: 'range', kind: 'gesture', label: 'range', shortcut: { keys: ['⇧'], mouse: 'left' } },
];

const MANY = 'Pick one child to move. A run has no single place to land.';

const nameOf = (ctx: FlexActionContext, index: number): string =>
  ctx.container.children[index]?.id ?? `item ${index + 1}`;

/** Every move is the same call with a different destination, so the refusal for
 *  a multi-pick is written once instead of four times. */
const moveRun = (ctx: FlexActionContext, from: number, to: number) => (): void => {
  if (ctx.selection.kind !== 'items') return;
  if (ctx.selection.indices.length !== 1) { ctx.edits.refuse(MANY); return; }
  ctx.edits.move(from, to);
  ctx.edits.setSelection({ kind: 'items', indices: [to], anchor: to });
};

const contextualActions = (ctx: FlexActionContext): EditorAction[] => {
  if (ctx.selection.kind !== 'items') return [];
  const { indices } = ctx.selection;
  const axis = axisOf(ctx.container.direction);
  const last = ctx.container.children.length - 1;
  const first = Math.min(...indices);
  const end = Math.max(...indices);
  const name = indices.length === 1 ? nameOf(ctx, first) : `${indices.length} children`;

  // `run` is left off a move that cannot apply, which is also what keeps its
  // key from firing (`runnerFor` only answers for rows that can run).
  const move = (
    key: string, group: string, icon: EditorAction['icon'], label: string,
    can: boolean, from: number, to: number, cap?: string,
  ): EditorAction => ({
    key, kind: 'button', icon, group, label: `Move ${name} ${label}`, disabled: !can,
    ...(cap === undefined ? {} : { shortcut: { keys: [cap] } }),
    ...(can ? { run: moveRun(ctx, from, to) } : {}),
  });

  return [
    move('move-start', 'order', START_ICON[axis], 'to the start', first > 0, first, 0),
    move('move-earlier', 'order', EARLIER_ICON[axis], 'earlier', first > 0, first, first - 1, EARLIER_KEY[axis]),
    move('move-later', 'order', LATER_ICON[axis], 'later', end < last, end, end + 1, LATER_KEY[axis]),
    move('move-end', 'order', END_ICON[axis], 'to the end', end < last, end, last),
  ];
};

/** Legend-only rows. `clear` is here instead of in the toolbar because `Esc`
 *  has no button: there is nothing to press to un-select except the strip. */
const gestureActions = (ctx: FlexActionContext): EditorAction[] => {
  if (ctx.selection.kind !== 'items') return GESTURES;
  return [
    { key: 'move-cursor', kind: 'gesture', label: 'move', shortcut: { keys: ['←', '→'] } },
    { key: 'clear', kind: 'gesture', label: 'clear', shortcut: { keys: ['Esc'] } },
  ];
};

const flexActions = (ctx: FlexActionContext): EditorAction[] =>
  [...contextualActions(ctx), ...gestureActions(ctx)];

/** Two or three words, upper-cased by the sheet, not by the string, so a
 *  screen reader hears "item 2" and not "I T E M". `null` is the
 *  nothing-selected case and the toolbar prints its own hint for it. */
const chipOf = (selection: FlexSelection): string | null => {
  if (selection.kind === 'none') return null;
  return selection.indices.length === 1
    ? `item ${Math.min(...selection.indices) + 1}`
    : `${selection.indices.length} items`;
};

/** The one line under the strip: what is picked, and what it is called. */
const statusOf = (ctx: FlexActionContext): string => {
  const total = ctx.container.children.length;
  // SHORT ENOUGH TO SURVIVE THE 232px RAIL. The legend truncates instead of
  // wrapping (§55.1), and the older status that also said "in flow order" lost
  // its last word to the ellipsis in round 20's photograph.
  const what = `${total} ${total === 1 ? 'child' : 'children'}`;
  if (ctx.selection.kind === 'none') return `${what}, none selected`;
  const { indices } = ctx.selection;
  if (indices.length === 1) {
    const at = Math.min(...indices);
    return `item ${at + 1} of ${total} is ${nameOf(ctx, at)}`;
  }
  return `${indices.length} of ${total} are ${indices.map((i) => nameOf(ctx, i)).join(', ')}`;
};

export { GESTURES, MANY, axisOf, chipOf, contextualActions, flexActions, gestureActions, statusOf };
