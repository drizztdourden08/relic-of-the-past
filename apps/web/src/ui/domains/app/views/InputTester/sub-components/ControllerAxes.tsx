/* @layer renderer-components @kind component */
// Derived from the device's resolved axis controls (see resolve-device.ts), not a preset's axis list.
import type { CSSProperties } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Button } from '../../../../../design-system/primitives/Button';
import type { ControllerInputState } from '../../../../../../lib/input/controller-input-store';
import { resolveLiveControlState } from '@shared/input/family';
import type { ResolvedControl, SdlAxisName } from '@shared/input/family';
import { SDL_AXIS } from '@shared/input/sdl-buttons';
import { groupAxisControls } from '@app/lib/input/resolved-axis-groups';
import type { CalibrationTarget } from './controller-card-types';
import { AxisRecordButton, StickCircle, TriggerBar } from './input-cal-visuals';

const S: Record<string, CSSProperties> = {
  col: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  row: { display: 'flex', gap: 4, alignItems: 'center' },
};

interface ControllerAxesProps {
  state: ControllerInputState;
  controls: readonly ResolvedControl[];
  onCalibrate: (target: CalibrationTarget) => void;
}

const ControllerAxes = ({ state, controls, onCalibrate }: ControllerAxesProps) => {
  const { stickPairs, triggers } = groupAxisControls(controls);
  if (stickPairs.length === 0 && triggers.length === 0) return null;

  return (
    <Box className="input-cal__sticks">
      {stickPairs.map((pair, pairIdx) => {
        const x = resolveLiveControlState(pair.xControl, state.buttons, state.axes).value;
        const y = resolveLiveControlState(pair.yControl, state.buttons, state.axes).value;
        return (
          <Box key={pair.xControl.position} style={S.col}>
            <StickCircle x={x} y={y} label={pair.label} iconPrefix={pair.basePrefix || undefined} />
            <Box style={S.row}>
              <AxisRecordButton getValues={() => [x, y]} label={pair.label} />
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => onCalibrate({ type: 'stick', side: pairIdx === 0 ? 'left' : 'right' })}
                title={`Calibrate ${pair.label}`}
              >Cal</Button>
            </Box>
          </Box>
        );
      })}
      {triggers.map((trigger) => {
        const live = resolveLiveControlState(trigger, state.buttons, state.axes);
        const axisIndex = SDL_AXIS[trigger.position as SdlAxisName];
        return (
          <Box key={trigger.position} style={S.col}>
            <TriggerBar value={live.value} label={trigger.label} pressed={live.pressed} />
            <Box style={S.row}>
              <AxisRecordButton getValues={() => [live.value]} label={trigger.label} />
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => onCalibrate({ type: 'trigger', axisIndex, label: trigger.label })}
                title={`Calibrate ${trigger.label}`}
              >Cal</Button>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export { ControllerAxes };
