/* @layer renderer-components @kind types */
import type { FunctionMapping } from '@shared/types/controls';

interface ControllerDisconnectOverlayProps {
  controllerName: string;
  pauseMapping: FunctionMapping | null;
  prevMapping: FunctionMapping | null;
  nextMapping: FunctionMapping | null;
  canSwitchProfile: boolean;
  onResume: () => void;
}

export type { ControllerDisconnectOverlayProps };
