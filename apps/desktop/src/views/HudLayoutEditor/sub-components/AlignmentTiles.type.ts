/* @layer renderer-components @kind types */
import type { IconName } from '@drizztdourden08/tessera/primitives';
import type { AlignOption, AlignValue, FlowDirection } from '@app/hud-layout-editing/align-options';

interface AlignRowSpec {
  key: string;
  cap: string;
  capIcon?: IconName;
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
