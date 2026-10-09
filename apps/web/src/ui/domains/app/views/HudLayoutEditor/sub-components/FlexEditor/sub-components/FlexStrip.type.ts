/* @layer renderer-components @kind types */
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import type { FlowDirection } from '../../../behavior/align-options';

interface FlexCell {
  id: string;
  weight: number;
  selected: boolean;
}

interface FlexStripProps {
  cells: readonly FlexCell[];
  direction: FlowDirection;
  wrap: boolean;
  cursor: number;
  label: string;
  onCellDown: (index: number, event: ReactPointerEvent) => void;
  onKeyDown: (event: KeyboardEvent) => void;
}

export type { FlexCell, FlexStripProps };
