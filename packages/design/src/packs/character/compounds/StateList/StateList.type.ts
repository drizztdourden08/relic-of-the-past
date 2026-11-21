/* @layer renderer-components @kind types */
import type { PoseLabelsProp } from '../../behavior/pose-labels';

interface StateListProps extends PoseLabelsProp {
  selected: number;
  onSelect: (action: number) => void;
  fill?: boolean;
}

export type { StateListProps };
