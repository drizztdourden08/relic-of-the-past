/* @layer renderer-components @kind types */
import type { ControllerBusType, ControllerConnectionState } from '@shared/ipc';

interface ControllerStatusBarProps {
  busType?: ControllerBusType;
  /** Bus-agnostic wired/wireless read, shown only as a fallback when
   *  `busType` is unknown. Never rendered alongside a bus chip. */
  connectionState?: ControllerConnectionState;
  hasRumble?: boolean;
  hasGyro?: boolean;
  /** Already-formatted identifier text, e.g. a vendor:product id or a
   *  fallback like an unmapped-gamepad label. Rendered as monospace. */
  idLabel?: string;
}

export type { ControllerStatusBarProps };
