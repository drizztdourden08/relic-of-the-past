/* @layer renderer-components @kind types */
import type { EditorSampleState } from '@app/hud-layout-editing/sample-state.type';
import type { PlacedNode } from '@rotp/hud';

interface StageGridEchoProps {
  placed: readonly PlacedNode[];
  scale: number;
  sample: EditorSampleState;
}

export type { StageGridEchoProps };
