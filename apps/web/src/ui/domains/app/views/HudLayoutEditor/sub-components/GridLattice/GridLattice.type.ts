/* @layer renderer-components @kind types */
import type { KeyboardEvent, PointerEvent } from 'react';
import type { Extent } from '@shared/types/hud';
import type { CellRef, Occupant } from './lattice-geometry';

/**
 * FOUR STATES, OUT OF TWO FACTS. Is this cell in the selection, and is a child
 * standing in it? §48's fourth state was `coplace`, an armed placement aimed at
 * an occupied cell; §50 deleted every placement from the grid editor, so the
 * fourth state is now the honest crossing of the two facts the drawing has left.
 */
type LatticeCellState = 'empty' | 'occupied' | 'selected' | 'occupied-selected';

type TrackAxis = 'columns' | 'rows';

interface GridLatticeProps {
  /** Column extents, for the header text. */
  columns: readonly Extent[];
  /** Row extents. Short or absent when the grid's rows are implicit. */
  rows: readonly Extent[] | undefined;
  rowCount: number;
  /** The engine's own solved track sizes, in game px. Empty = nothing solved
   *  yet, and every track draws at an equal share. */
  colSizes: readonly number[];
  rowSizes: readonly number[];
  /** Drawn faintly, read-only: a label over the cells a child covers, so a
   *  person can see what a track edit is about to affect. Never clickable. */
  occupants: readonly Occupant[];
  /** Which child the mount is ABOUT, if any. It is drawn brighter than its siblings. */
  activeChildId?: string;
  cellState: (cell: CellRef) => LatticeCellState;
  trackOn: (axis: TrackAxis, index: number) => boolean;
  cursor: CellRef;
  /** Spoken name for the whole lattice, such as "the grid" or "wallet's cell". */
  label: string;
  onCellDown: (cell: CellRef, event: PointerEvent) => void;
  onCellEnter: (cell: CellRef) => void;
  onPointerUp: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
  /** Omitted by `CellPicker`: a child's own picker may not select a track. */
  onTrackDown?: (axis: TrackAxis, index: number, event: PointerEvent) => void;
  onCornerDown?: (event: PointerEvent) => void;
  /**
   * THE THREE TRACK-EDITING PROPS, AND THEY ARE ALL OPTIONAL TOGETHER (§55).
   * Given, the strips grow a trailing `+` and a selected header's label becomes
   * its size menu. Omitted, as `CellPicker`'s mount does, the lattice is the pure
   * drawing it has always been, because a child's own picker may not add,
   * remove or resize its parent's tracks.
   */
  onAddTrack?: (axis: TrackAxis) => void;
  onSizeTrack?: (axis: TrackAxis, index: number, extent: Extent) => void;
  /** The size menu opens ON the declared extent, not the solved one. */
  extentOf?: (axis: TrackAxis, index: number) => Extent | undefined;
}

export type { GridLatticeProps, LatticeCellState, TrackAxis };
