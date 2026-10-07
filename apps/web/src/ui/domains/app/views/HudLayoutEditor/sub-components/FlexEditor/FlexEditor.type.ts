/* @layer renderer-components @kind types */
/**
 * A FLEX CONTAINER'S STRUCTURE IS THE ORDER OF ITS CHILDREN (§58), and that one
 * sentence is why this type is so much smaller than the grid's.
 *
 * > "the flex should have a manipulation section as well. same principle"
 *
 * THE GRID'S MANIPULATION EDITS TRACKS AND THE CHILDREN FOLLOW. A flex container
 * has no tracks: each child IS a track, laid end to end along `direction`. So
 * the same principle lands on a strip with one cell per child, in flow order,
 * and the actions are the ones a line of tracks has that a lattice also has:
 * move one earlier, later, to the start, to the end.
 *
 * WHAT IT DELIBERATELY DOES NOT HAVE. No insert and no remove: a child is added
 * by the toolbar and deleted from the outline, and a manipulation section that
 * grew its own would be two doors onto one edit. No property editing either, because a
 * child's own size, place and alignment are that child's sections.
 *
 * A SELECTION IS CONTEXT, NOT AN EDIT. §50 pinned that rule for the lattice and
 * `hud-stage-select-only` pins it for the stage. Nothing in this union is ever
 * written: it says what the toolbar offers and which cells the stage echoes.
 */
import type { EditorAction, EditorShortcut } from '../SelectionBands';
import type { IndexRun } from '../../behavior/index-selection';
import type { HudFlexContainer } from '@shared/types/hud';

/** Indices into `container.children`, 0-based. `none` is the resting state and
 *  the one the toolbar prints its hint for. */
type FlexSelection = { kind: 'none' } | ({ kind: 'items' } & IndexRun);

/** Every write this component can make. There is exactly one, because a
 *  reorder is a `moveNode` and `applyDrop` is the editor's only caller of it. */
interface FlexEditorEdits {
  move: (index: number, to: number) => void;
  setSelection: (next: FlexSelection) => void;
  /** A refused action says why, in the legend, instead of vanishing. */
  refuse: (reason: string) => void;
}

interface FlexActionContext {
  container: HudFlexContainer;
  selection: FlexSelection;
  edits: FlexEditorEdits;
}

export type { EditorAction, EditorShortcut, FlexActionContext, FlexEditorEdits, FlexSelection };
