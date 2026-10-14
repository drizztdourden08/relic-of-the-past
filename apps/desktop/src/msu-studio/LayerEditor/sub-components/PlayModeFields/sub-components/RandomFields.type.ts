/* @layer renderer-components @kind types */
import type { LayerPlayMode } from '@rotp/game-data';

type RandomFieldsProps = {
  mode: Extract<LayerPlayMode, { kind: 'random' }>;
  layerId: string;
  disabled: boolean;
  onChange: (mode: LayerPlayMode) => void;
};

export type { RandomFieldsProps };
