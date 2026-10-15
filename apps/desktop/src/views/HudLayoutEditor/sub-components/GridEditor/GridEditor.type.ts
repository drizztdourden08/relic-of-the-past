/* @layer renderer-components @kind types */
import type { EditorAction } from '@app/hud-layout-editing/selection-bands.type';
import type { HudGridContainer } from '@rotp/hud';
import type { OsKind } from '@drizztdourden08/brock-core';
import type { CellRef, Occupant, TrackAxis } from '../GridLattice';
import type { useGridSelection } from './behavior/useGridSelection';

type GridSelection =
  | { kind: 'none' }
  | { kind: 'cells'; cells: readonly CellRef[]; anchor: CellRef }
  | { kind: 'track'; axis: TrackAxis; indices: readonly number[]; anchor: number };

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

interface ArrowStep { dx: number; dy: number }

interface StatusParams {
  selection: GridSelection;
  occupants: readonly Occupant[];
  columns: number;
  rows: number;
}

interface GridKeysInput {
  grid: ReturnType<typeof useGridSelection>;
  occupants: readonly Occupant[];
  columns: number;
  rows: number;
  actions: readonly GridAction[];
}

type PatchGrid = (patch: Partial<HudGridContainer>) => void;

export type {
  ArrowStep, GridAction, GridActionContext, GridEditorProps,
  GridKeyParams, GridKeysInput, GridSelection, PatchGrid, StatusParams,
};
export type { CellRef, Occupant, TrackAxis };
