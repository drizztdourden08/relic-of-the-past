/* @layer shared-hud @kind types */
import type { Extent } from '../../types/hud-node';

interface GridCell { column: number; row: number; colSpan: number; rowSpan: number }

interface TrackSizing {
  tracks: readonly Extent[];
  natural: readonly number[];
  available: number;
  gap: number;
}

export type { GridCell, TrackSizing };
