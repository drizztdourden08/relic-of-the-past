/* @layer renderer-components @kind types */
import type { ResolvedControl } from '@rotp/input-mapping';
import type { ControllerInputState } from '../../../input/controller-input-store';
import type { StickPairGroup } from '../../../input/resolved-axis-groups/resolved-axis-groups.type';
import type { CalibrationTarget } from './ControllerCard.type';

interface ControllerAxesProps {
  state: ControllerInputState;
  controls: readonly ResolvedControl[];
  onCalibrate: (target: CalibrationTarget) => void;
}

interface StickAxisPanelProps {
  pair: StickPairGroup;
  pairIdx: number;
  state: ControllerInputState;
  onCalibrate: (target: CalibrationTarget) => void;
}

interface TriggerAxisPanelProps {
  trigger: ResolvedControl;
  state: ControllerInputState;
  onCalibrate: (target: CalibrationTarget) => void;
}

export type { ControllerAxesProps, StickAxisPanelProps, TriggerAxisPanelProps };
