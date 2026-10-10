/* @layer renderer-components @kind types */
import type { Scope } from '@app/hud-layout-editing/formula-scope';

interface InstanceStripProps {
  expr: string;
  instances: readonly Scope[];
  previewIndex?: number;
}

export type { InstanceStripProps };
