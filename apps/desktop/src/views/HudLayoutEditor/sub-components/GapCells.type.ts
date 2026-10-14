/* @layer renderer-components @kind types */
import type { GapAxis, GapCell } from './LayoutSettings.type';
import type { Value } from '@rotp/hud';

interface GapCellsProps {
  gap: readonly GapCell[];
  onGap: (axis: GapAxis, next: Value) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

export type { GapCellsProps };
