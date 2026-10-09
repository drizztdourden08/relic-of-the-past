/* @layer renderer-components @kind types */
import type { LayerPlayMode } from '@shared/types/msu-manifest';

interface PlayModeFieldsProps {
  mode: LayerPlayMode;
  layerId: string;
  disabled?: boolean;
  onChange: (mode: LayerPlayMode) => void;
}

type LoopOrder = 'sequential' | 'random' | 'single';

export type { PlayModeFieldsProps, LoopOrder };
