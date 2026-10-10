/* @layer renderer-components @kind types */
import type { FlowDirection } from '@app/hud-layout-editing/align-options';

interface FlowSettingsProps {
  direction: FlowDirection;
  onDirection: (next: FlowDirection) => void;
  wrap: boolean;
  onWrap: (next: boolean) => void;
}

export type { FlowSettingsProps };
