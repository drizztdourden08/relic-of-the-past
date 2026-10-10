/* @layer renderer-components @kind types */
import type { EditorAction } from '@app/hud-layout-editing/selection-bands.type';

interface SelectionToolbarProps {
  chip: string | null;
  actions: readonly EditorAction[];
  hint?: string;
}

export type { SelectionToolbarProps };
