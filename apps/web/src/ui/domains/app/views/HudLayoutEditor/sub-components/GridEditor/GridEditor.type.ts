/* @layer renderer-components @kind types */
import type { EditorAction, EditorActionKind, EditorShortcut } from '../SelectionBands';
import type { HudGridContainer } from '@shared/types/hud';
import type { OsKind } from '@shared/platform';
import type { CellRef, Occupant, TrackAxis } from '../GridLattice';

type GridSelection =
  | { kind: 'none' }
  | { kind: 'cells'; cells: readonly CellRef[]; anchor: CellRef }
  | { kind: 'track'; axis: TrackAxis; indices: readonly number[]; anchor: number };

type GridShortcut = EditorShortcut;
type GridActionKind = EditorActionKind;
type GridAction = EditorAction;

interface GridEditorEdits {
  patchContainer: (patch: Partial<HudGridContainer>) => void;
  setSelection: (next: GridSelection) => void;
  refuse: (reason: string) => void;
}

interface GridActionContext {
  container: HudGridContainer;
  selection: GridSelection;
  cursor: CellRef;
  occupants: readonly Occupant[];
  rows: number;
  edits: GridEditorEdits;
}

interface GridEditorProps {
  container: HudGridContainer;
  onPatchContainer: (patch: Partial<HudGridContainer>) => void;
}

interface GridKeyParams {
  os: OsKind;
  selection: GridSelection;
  cursor: CellRef;
  columns: number;
  rows: number;
  actions: readonly GridAction[];
  select: (next: GridSelection) => void;
  setCursor: (cell: CellRef) => void;
}

interface ArrowStep { glyph: string; dx: number; dy: number }

interface StatusParams {
  selection: GridSelection;
  occupants: readonly Occupant[];
  columns: number;
  rows: number;
}

type PatchGrid = (patch: Partial<HudGridContainer>) => void;

export type {
  ArrowStep, GridAction, GridActionContext, GridActionKind, GridEditorEdits, GridEditorProps,
  GridKeyParams, GridSelection, GridShortcut, PatchGrid, StatusParams,
};
export type { CellRef, Occupant, TrackAxis };
