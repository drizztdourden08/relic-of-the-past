/* @layer renderer-components @kind types */
import type { EditorAction, EditorActionKind, EditorShortcut } from '../SelectionBands';
import type { HudGridContainer } from '@shared/types/hud';
import type { CellRef, Occupant, TrackAxis } from '../GridLattice';

/**
 * ONE selection, made three ways and NOT a fourth. §48 had an `occupant` kind
 * that armed a placement on a child; §50 deleted it outright, because the grid
 * editor edits the GRID and nothing else. `cells` is a LIST and not a
 * rectangle because the primary modifier toggles cells into it one at a time,
 * which a rectangle cannot hold; `track` carries the axis so the toolbar knows
 * which extent list it is editing.
 *
 * A SELECTION IS CONTEXT, NOT AN EDIT. Nothing in this union is ever written to
 * the document: it says what the toolbar offers and what the stage echoes, and a
 * click, a modifier-click, a shift-click and a drag across cells all leave the
 * document byte-identical.
 */
type GridSelection =
  | { kind: 'none' }
  | { kind: 'cells'; cells: readonly CellRef[]; anchor: CellRef }
  | { kind: 'track'; axis: TrackAxis; indices: readonly number[]; anchor: number };

/**
 * THE ACTION TABLE IS THE BANDS' SHAPE NOW, NOT THE GRID'S (§58). It moved to
 * `SelectionBands/selection-bands.type.ts` the day the flex manipulation section
 * needed the same toolbar and the same legend; these three names stay as aliases
 * because every file in this folder reads in the grid's own vocabulary.
 *
 * THERE WAS A THIRD KIND, `control`, AND ITS DELETION IS §55's. It put a real
 * field in the action strip (the picked track's extent, 81px of it), which is
 * both a property in an action row (the category error §51 and §54 were each
 * opened for) and the reason the strip was two rows deep at the 232px rail. The
 * size lives on the track's own header now.
 */
type GridShortcut = EditorShortcut;
type GridActionKind = EditorActionKind;
type GridAction = EditorAction;

/** Every write the table can make. There are only two, both about the GRID. */
interface GridEditorEdits {
  /** The container itself: tracks, gap, item alignment, the guide colour. */
  patchContainer: (patch: Partial<HudGridContainer>) => void;
  setSelection: (next: GridSelection) => void;
  /** A refused action says why, in the legend, instead of vanishing. */
  refuse: (reason: string) => void;
}

interface GridActionContext {
  container: HudGridContainer;
  selection: GridSelection;
  cursor: CellRef;
  /** Read-only: drawn so a track edit's blast radius is visible. */
  occupants: readonly Occupant[];
  rows: number;
  edits: GridEditorEdits;
}

export type {
  GridAction, GridActionContext, GridActionKind, GridEditorEdits, GridSelection, GridShortcut,
};
export type { CellRef, Occupant, TrackAxis };
