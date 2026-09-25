/* @layer renderer-components @kind logic */
/**
 * THE ONE TABLE, AND EVERY ROW IN IT IS AN ACTION ON THE SELECTION (§54).
 * The toolbar, the legend and the keyboard all read the same rows, which is why
 * a legend can never promise a shortcut the toolbar does not have.
 *
 * THERE IS NO `persistentActions` ANY MORE, AND ITS ABSENCE IS THE AMENDMENT.
 * §50 filed the grid's own properties (the engine, the gaps, the item
 * alignment, the guide colour) as rows of the NOTHING-SELECTED state, so
 * pressing a cell evicted them ("very jarring"). §51 kept them in the toolbar as
 * a persistent LEFT GROUP, which fixed the eviction and left the real complaint
 * standing: "that toolbar that sticks to the top is for contextualized selection
 * ONLY." A property in an action table is a category error however the table is
 * partitioned, so the properties left the table AND the toolbar. They are
 * `GridSettings`, a labelled panel above the grid, which takes no selection.
 *
 * WHAT IS LEFT IS TWO TABLES, BOTH CONTEXTUAL BY DEFINITION:
 *
 * - `contextualActions` is what can be done TO THE SELECTION, and is `[]` when
 *   there is none. The toolbar then prints a hint in the same
 *   reserved height instead of shrinking.
 * - `gestureActions` is legend-only: what the pointer and the arrows do here.
 *
 * ADD-COLUMN AND ADD-ROW ARE NOT HERE EITHER. They are always available and have
 * nothing to do with what is picked, so they are the `TRACKS` row of the settings
 * panel, beside the count they change.
 *
 * ITS VOCABULARY IS THE GRID, AND NOTHING BUT (§50): `columns` and `rows` (add ·
 * insert before/after · remove · move · size), `gap`, `justifyItems`/
 * `alignItems`, `guide.color` and the engine toggle. §48's "place it here",
 * "move", "span", "clear span" and the self-alignment pair are DELETED, along
 * with the occupant selection they hung off: a child is moved in its own
 * Placement section, by its own `CellPicker`, and this control never writes one.
 *
 * AN ACTION THAT CANNOT APPLY IS ABSENT, NOT DISABLED. The toolbar is the answer
 * to "what can I do to what I selected", and a row of greyed glyphs answers it
 * badly.
 */
import { boundsOf } from '../../GridLattice';
import { GRID_ICONS } from './grid-icons';
import { insertRun, trackActions } from './grid-track-actions';
import type { GridAction, GridActionContext } from '../GridEditor.type';

/** The four pointer gestures, printed under every state that has a lattice to
 *  use them on. They write NOTHING. A click, a modifier click, a shift click
 *  and a drag all leave the document byte-identical; what they change is what
 *  the toolbar offers and what the stage echoes. */
const GESTURES: GridAction[] = [
  { key: 'pick', kind: 'gesture', label: 'select', shortcut: { mouse: 'left' } },
  { key: 'add-to', kind: 'gesture', label: 'add', shortcut: { keys: ['{mod}'], mouse: 'left' } },
  { key: 'range', kind: 'gesture', label: 'range', shortcut: { keys: ['⇧'], mouse: 'left' } },
  { key: 'rectangle', kind: 'gesture', label: 'rectangle', shortcut: { mouse: 'drag' } },
];

const cellActions = (ctx: GridActionContext): GridAction[] => {
  if (ctx.selection.kind !== 'cells') return [];
  const bounds = boundsOf(ctx.selection.cells);
  return [
    {
      key: 'insert-column-before', kind: 'button', icon: GRID_ICONS.insertColumnBefore, group: 'columns',
      label: `Insert a column before ${bounds.c0}`, run: insertRun(ctx, 'columns', bounds.c0 - 1),
    },
    {
      key: 'insert-column-after', kind: 'button', icon: GRID_ICONS.insertColumnAfter, group: 'columns',
      label: `Insert a column after ${bounds.c1}`, run: insertRun(ctx, 'columns', bounds.c1),
    },
    {
      key: 'insert-row-before', kind: 'button', icon: GRID_ICONS.insertRowBefore, group: 'rows',
      label: `Insert a row before ${bounds.r0}`, run: insertRun(ctx, 'rows', bounds.r0 - 1),
    },
    {
      key: 'insert-row-after', kind: 'button', icon: GRID_ICONS.insertRowAfter, group: 'rows',
      label: `Insert a row after ${bounds.r1}`, run: insertRun(ctx, 'rows', bounds.r1),
    },
  ];
};

const contextualActions = (ctx: GridActionContext): GridAction[] => {
  switch (ctx.selection.kind) {
    case 'cells': return cellActions(ctx);
    case 'track': return trackActions(ctx);
    default: return [];
  }
};

/** Legend-only rows. `clear` is here instead of in the toolbar because `Esc`
 *  has no button: there is nothing to press to un-select except the lattice. */
const gestureActions = (ctx: GridActionContext): GridAction[] => {
  switch (ctx.selection.kind) {
    case 'cells': return [
      { key: 'move-cursor', kind: 'gesture', label: 'move', shortcut: { keys: ['←', '→', '↑', '↓'] } },
      { key: 'extend', kind: 'gesture', label: 'extend', shortcut: { keys: ['⇧', '←', '→', '↑', '↓'] } },
      { key: 'clear', kind: 'gesture', label: 'clear', shortcut: { keys: ['Esc'] } },
    ];
    case 'track': return [{ key: 'clear', kind: 'gesture', label: 'clear', shortcut: { keys: ['Esc'] } }];
    default: return GESTURES;
  }
};

/** The whole table in render order. The toolbar's rows come first, then the legend's.
 *  `grid-keys.ts` looks a press up across all of it. */
const gridActions = (ctx: GridActionContext): GridAction[] =>
  [...contextualActions(ctx), ...gestureActions(ctx)];

const sizeOf = (bounds: { c0: number; c1: number; r0: number; r1: number }): string =>
  `${bounds.c1 - bounds.c0 + 1} × ${bounds.r1 - bounds.r0 + 1}`;

export { GESTURES, contextualActions, gestureActions, gridActions, sizeOf };
