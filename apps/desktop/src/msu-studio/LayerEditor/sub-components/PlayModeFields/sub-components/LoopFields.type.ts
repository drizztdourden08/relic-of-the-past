/* @layer renderer-components @kind types */
import type { LayerPlayMode } from '@rotp/game-data';

type LoopFieldsProps = {
  mode: Extract<LayerPlayMode, { kind: 'loop' }>;
  layerId: string;
  disabled: boolean;
  onChange: (mode: LayerPlayMode) => void;
};

export type { LoopFieldsProps };
