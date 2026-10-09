/* @layer renderer-components @kind types */
import type { EditorSampleState } from '../../behavior/useSampleState.type';
import type { PlacedNode } from '@rotp/hud';

interface StageGridEchoProps {
  placed: readonly PlacedNode[];
  scale: number;
  sample: EditorSampleState;
}

export type { StageGridEchoProps };
