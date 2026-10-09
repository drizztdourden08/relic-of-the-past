/* @layer renderer-components @kind types */
import type { CSSProperties } from 'react';
import type { ControllerInputState } from '../../../../../../lib/input/controller-input-store';
import type { ResolvedControl } from '@shared/input/family';
import type { StickPairGroup } from '@app/lib/input/resolved-axis-groups';
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
  styles: Record<string, CSSProperties>;
  onCalibrate: (target: CalibrationTarget) => void;
}

interface TriggerAxisPanelProps {
  trigger: ResolvedControl;
  state: ControllerInputState;
  styles: Record<string, CSSProperties>;
  onCalibrate: (target: CalibrationTarget) => void;
}

export type { ControllerAxesProps, StickAxisPanelProps, TriggerAxisPanelProps };
