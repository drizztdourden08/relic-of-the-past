/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { groupAxisControls } from '@app/lib/input/resolved-axis-groups';
import { StickAxisPanel } from './StickAxisPanel';
import { TriggerAxisPanel } from './TriggerAxisPanel';
import type { ControllerAxesProps } from './ControllerAxes.type';

const S: Record<string, CSSProperties> = {
  col: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  row: { display: 'flex', gap: 4, alignItems: 'center' },
};

const ControllerAxes = ({ state, controls, onCalibrate }: ControllerAxesProps) => {
  const { stickPairs, triggers } = groupAxisControls(controls);
  if (stickPairs.length === 0 && triggers.length === 0) return null;

  return (
    <Box className="input-cal__sticks">
      {stickPairs.map((pair, pairIdx) => (
        <StickAxisPanel key={pair.xControl.position} pair={pair} pairIdx={pairIdx} state={state} styles={S} onCalibrate={onCalibrate} />
      ))}
      {triggers.map((trigger) => (
        <TriggerAxisPanel key={trigger.position} trigger={trigger} state={state} styles={S} onCalibrate={onCalibrate} />
      ))}
    </Box>
  );
};

export { ControllerAxes };
