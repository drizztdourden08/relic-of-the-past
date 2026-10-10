/* @layer renderer-components @kind types */
import type { EditorSampleState } from '@app/hud-layout-editing/sample-state.type';
import type { PlacedNode } from '@rotp/hud';

interface EditorStageProps {
  placed: readonly PlacedNode[];
  sample: EditorSampleState;
  ground: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export type { EditorStageProps };
