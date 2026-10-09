/* @layer renderer-components @kind types */
import type { FlowDirection } from '../behavior/align-options';

interface FlowSettingsProps {
  direction: FlowDirection;
  onDirection: (next: FlowDirection) => void;
  wrap: boolean;
  onWrap: (next: boolean) => void;
}

export type { FlowSettingsProps };
