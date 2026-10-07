/* @layer renderer-components @kind logic */
/**
 * What a selected column or row can have done to it. That is ALL of what this
 * editor does, beside the container's own gap, alignment, guide colour and
 * engine.
 *
 * THE "A CHILD IS IN THE WAY" REFUSAL IS GONE (§50). §48 kept `remove` in the
 * toolbar and made it refuse, naming the child standing in the track; the
 * maintainer's rule is that children are kept valid automatically, so the edit
 * just happens and `editGridTracks` moves the children with it. The one refusal
 * left is structural and nothing to do with children: `columns` may never be
 * empty, which is `validate-container.ts`'s own floor.
 *
 * IT IS THE WHOLE OF THE CONTEXTUAL TOOLBAR (§54). Every row below is an action
 * on the selected track, so all of them live in the sticky strip above the
 * lattice and none survives a `clear`. That is the line §51 drew and §54
 * finishes: the strip holds actions on the selection and NOTHING ELSE. `Esc`'s
 * legend row is in `gestureActions`, because it has no button to sit on.
 *
 * SIZE IS NOT ONE OF THEM ANY MORE (§55). The table's one `control` row was
 * an 81px `[auto ▾]` field wedged between the chip and the buttons, which is
 * what made a selected track's strip two rows deep at the 232px rail. The
 * selected header already prints `auto`/`fill`, so the header's own label is the
 * menu now (`TrackHead`) and the row is deleted, not moved: a control in
 * two places is two controls.
 *
 * EVERY TRACK EDIT GOES THROUGH ONE DOCUMENT RULE. `shared/hud/layouts/
 * grid-track-edits.ts` returns the container with both halves already agreed
 * (the new track list and the children's remapped `place`), so the panel never
 * writes one without the other and no caller can forget the second.
 *
 * AND THAT DOOR TAKES A CONTAINER, NOT A SELECTION (§54). `applyTrackEdit` is
 * the door; `applyEdit` is the same door reached through a `GridActionContext`.
 * The split exists because APPEND moved out of the toolbar and into the settings
 * panel, whose whole guarantee is that it never sees a selection, so it cannot
 * be handed a context that carries one.
 */
import { editGridTracks } from '@shared/hud/layouts';
import { EARLIER_ICON, EARLIER_KEY, GRID_ICONS, LATER_ICON, LATER_KEY } from './grid-icons';
import type { Extent, HudGridContainer } from '@shared/types/hud';
import type { TrackEdit } from '@shared/hud/layouts';
import type { GridAction, GridActionContext, TrackAxis } from '../GridEditor.type';

const ONE: Record<TrackAxis, string> = { columns: 'column', rows: 'row' };

const tracksOf = (container: HudGridContainer, axis: TrackAxis): readonly Extent[] =>
  (axis === 'columns' ? container.columns : (container.rows ?? []));

/** The header's own size menu opens on the DECLARED extent, so an
 *  implicit row reads `auto` instead of whatever the solve gave it. */
const trackExtentOf = (
  container: HudGridContainer, axis: TrackAxis, index: number,
): Extent | undefined => tracksOf(container, axis)[index];

type PatchGrid = (patch: Partial<HudGridContainer>) => void;

/** The one door every track edit goes through: the shared rule answers with a
 *  whole container and the patch carries BOTH halves of its answer. It takes the
 *  container itself, so the settings panel, which never sees a selection, can
 *  use the same door the toolbar does. */
const applyTrackEdit = (container: HudGridContainer, patch: PatchGrid, edit: TrackEdit): void => {
  const next = editGridTracks(container, edit);
  patch(edit.axis === 'columns'
    ? { columns: next.columns, children: next.children }
    : { rows: next.rows, children: next.children });
};

const applyEdit = (ctx: GridActionContext, edit: TrackEdit): void =>
  applyTrackEdit(ctx.container, ctx.edits.patchContainer, edit);

const rangeLabel = (axis: TrackAxis, indices: readonly number[]): string => {
  const first = Math.min(...indices) + 1;
  const last = Math.max(...indices) + 1;
  return first === last ? `${ONE[axis]} ${first}` : `${axis} ${first}-${last}`;
};

/** Removing the range back to front, so the indices still name the same tracks
 *  after the first one goes. */
const removeRun = (ctx: GridActionContext, axis: TrackAxis, indices: readonly number[]) => (): void => {
  if (axis === 'columns' && ctx.container.columns.length - indices.length < 1) {
    ctx.edits.refuse('A grid needs at least one column.');
    return;
  }
  let next = ctx.container;
  for (const index of [...indices].sort((a, b) => b - a)) {
    next = editGridTracks(next, { op: 'remove', axis, index });
  }
  ctx.edits.patchContainer(axis === 'columns'
    ? { columns: next.columns, children: next.children }
    : { rows: next.rows, children: next.children });
  ctx.edits.setSelection({ kind: 'none' });
};

const shift = (ctx: GridActionContext, axis: TrackAxis, index: number, by: number) => (): void => {
  applyEdit(ctx, { op: 'move', axis, from: index, to: index + by });
  ctx.edits.setSelection({ kind: 'track', axis, indices: [index + by], anchor: index + by });
};

const insertRun = (ctx: GridActionContext, axis: TrackAxis, index: number) => (): void =>
  applyEdit(ctx, { op: 'insert', axis, index });

const trackActions = (ctx: GridActionContext): GridAction[] => {
  if (ctx.selection.kind !== 'track') return [];
  const { axis, indices } = ctx.selection;
  const count = Math.max(tracksOf(ctx.container, axis).length, axis === 'rows' ? ctx.rows : 0);
  const name = rangeLabel(axis, indices);
  const first = Math.min(...indices);
  const last = Math.max(...indices);
  const single = indices.length === 1;
  const canEarlier = single && first > 0;
  const canLater = single && last < count - 1;

  return [
    // DISABLED IN PLACE, NEVER ABSENT (`selection-bands.type.ts`): a move that
    // vanishes slides every button after it under the cursor.
    {
      key: 'move-earlier', kind: 'button', icon: EARLIER_ICON[axis], group: 'order',
      label: `Move ${name} earlier`, disabled: !canEarlier,
      ...(canEarlier ? { shortcut: { keys: [EARLIER_KEY[axis]] }, run: shift(ctx, axis, first, -1) } : {}),
    },
    {
      key: 'move-later', kind: 'button', icon: LATER_ICON[axis], group: 'order',
      label: `Move ${name} later`, disabled: !canLater,
      ...(canLater ? { shortcut: { keys: [LATER_KEY[axis]] }, run: shift(ctx, axis, last, 1) } : {}),
    },
    {
      key: 'insert-before', kind: 'button', group: 'insert',
      icon: axis === 'columns' ? GRID_ICONS.insertColumnBefore : GRID_ICONS.insertRowBefore,
      label: `Insert a ${ONE[axis]} before ${first + 1}`, run: insertRun(ctx, axis, first),
    },
    {
      key: 'insert-after', kind: 'button', group: 'insert',
      icon: axis === 'columns' ? GRID_ICONS.insertColumnAfter : GRID_ICONS.insertRowAfter,
      label: `Insert a ${ONE[axis]} after ${last + 1}`, run: insertRun(ctx, axis, last + 1),
    },
    {
      key: 'remove', kind: 'button', icon: GRID_ICONS.remove, group: 'remove',
      label: `Remove ${name}. Its children move to the nearest track`,
      shortcut: { keys: ['Del'] }, run: removeRun(ctx, axis, indices),
    },
  ];
};

export { applyEdit, applyTrackEdit, insertRun, rangeLabel, trackActions, trackExtentOf, tracksOf };
export type { PatchGrid };
