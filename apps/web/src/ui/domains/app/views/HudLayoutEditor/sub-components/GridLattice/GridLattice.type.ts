/* @layer renderer-components @kind types */
import type { KeyboardEvent, PointerEvent } from 'react';
import type { Extent } from '@shared/types/hud';
import type { CellRef, Occupant } from './behavior/lattice-geometry';

type LatticeCellState = 'empty' | 'occupied' | 'selected' | 'occupied-selected';

type TrackAxis = 'columns' | 'rows';

interface GridLatticeProps {
  columns: readonly Extent[];
  rows: readonly Extent[] | undefined;
  rowCount: number;
  colSizes: readonly number[];
  rowSizes: readonly number[];
  occupants: readonly Occupant[];
  activeChildId?: string;
  cellState: (cell: CellRef) => LatticeCellState;
  trackOn: (axis: TrackAxis, index: number) => boolean;
  cursor: CellRef;
  label: string;
  onCellDown: (cell: CellRef, event: PointerEvent) => void;
  onCellEnter: (cell: CellRef) => void;
  onPointerUp: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onTrackDown?: (axis: TrackAxis, index: number, event: PointerEvent) => void;
  onCornerDown?: (event: PointerEvent) => void;
  onAddTrack?: (axis: TrackAxis) => void;
  onSizeTrack?: (axis: TrackAxis, index: number, extent: Extent) => void;
  extentOf?: (axis: TrackAxis, index: number) => Extent | undefined;
}

export type { GridLatticeProps, LatticeCellState, TrackAxis };
