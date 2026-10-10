/* @layer renderer-components @kind types */
import type { OsKind } from '@drizztdourden08/brock-core';
import type { EditorAction } from '@app/hud-layout-editing/selection-bands.type';

interface SelectionLegendProps {
  actions: readonly EditorAction[];
  os: OsKind;
  status: string;
  refusal: string | null;
}

export type { SelectionLegendProps };
