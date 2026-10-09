/* @layer renderer-components @kind types */
import type { AlignOption, AlignValue, FlowDirection } from '../behavior/align-options';

interface AlignRowSpec {
  key: string;
  cap: string;
  label: string;
  engine: 'grid' | 'flex';
  axis: 'main' | 'cross';
  options: readonly AlignOption[];
  value: string;
  onChange: (next: AlignValue) => void;
}

interface AlignmentTilesProps {
  direction: FlowDirection;
  rows: readonly AlignRowSpec[];
}

export type { AlignRowSpec, AlignmentTilesProps };
