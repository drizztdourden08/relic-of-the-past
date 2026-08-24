/* @layer renderer-components @kind types */
import type { LayerPlayMode } from '@shared/types/msu-manifest';

interface PlayModeFieldsProps {
  mode: LayerPlayMode;
  /** The layer these controls belong to, so each one gets an id unique on the page. */
  layerId: string;
  disabled?: boolean;
  onChange: (mode: LayerPlayMode) => void;
}

export type { PlayModeFieldsProps };
