/* @layer renderer-components @kind types */
import type { ResolvedDevice } from '@rotp/input-mapping';
import type { ControllerInputState } from '../../../input/controller-input-store';

interface ControllerCardHeaderProps {
  deviceKey: string;
  resolvedDevice: ResolvedDevice;
  hasStickCal?: boolean;
  onReportDevice?: (deviceKey: string) => void;
}

interface ControllerButtonGridProps {
  resolvedDevice: ResolvedDevice;
  state: ControllerInputState;
}

interface ControllerCardActionsProps {
  deviceKey: string;
  state: ControllerInputState;
}

export type { ControllerButtonGridProps, ControllerCardActionsProps, ControllerCardHeaderProps };
