/* @layer renderer-components @kind types */
import type { ResolvedDevice } from '@rotp/input-mapping';
import type { ControllerInputState } from '../../../input/controller-input-store';

interface ControllerCardHeaderProps {
  deviceKey: string;
  resolvedDevice: ResolvedDevice;
  hasStickCal?: boolean;
  onReportDevice?: (deviceKey: string) => void;
}

interface ControllerCardActionsProps {
  deviceKey: string;
  state: ControllerInputState;
}

export type { ControllerCardActionsProps, ControllerCardHeaderProps };
