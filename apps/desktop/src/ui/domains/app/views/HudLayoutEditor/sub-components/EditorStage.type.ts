/* @layer renderer-components @kind types */
import type { EditorSampleState } from '../behavior/useSampleState.type';
import type { PlacedNode } from '@shared/hud/engine';

interface EditorStageProps {
  placed: readonly PlacedNode[];
  sample: EditorSampleState;
  ground: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export type { EditorStageProps };
