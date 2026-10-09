/* @layer shared-hud @kind types */
import type { Extent } from '../../../types/hud';

type TrackAxis = 'columns' | 'rows';

type TrackEdit =
  | { op: 'append'; axis: TrackAxis }
  | { op: 'insert'; axis: TrackAxis; index: number }
  | { op: 'remove'; axis: TrackAxis; index: number }
  | { op: 'move'; axis: TrackAxis; from: number; to: number }
  | { op: 'size'; axis: TrackAxis; indices: readonly number[]; extent: Extent };

interface AxisPlace { start: number; span: number }

export type { AxisPlace, TrackAxis, TrackEdit };
