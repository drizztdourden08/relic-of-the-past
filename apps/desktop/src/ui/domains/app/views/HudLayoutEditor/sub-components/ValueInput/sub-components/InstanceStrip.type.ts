/* @layer renderer-components @kind types */
import type { Scope } from '../../../behavior/formula-scope';

interface InstanceStripProps {
  expr: string;
  instances: readonly Scope[];
  previewIndex?: number;
}

export type { InstanceStripProps };
