/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { groupAxisControls } from '@app/input/resolved-axis-groups/group-axis-controls';
import { StickAxisPanel } from './StickAxisPanel';
import { TriggerAxisPanel } from './TriggerAxisPanel';
import type { ControllerCalRowProps } from './ControllerCalRow.type';
import './ControllerCalRow.css';

const ControllerCalRow = ({ state, controls, onCalibrate }: ControllerCalRowProps) => {
  const { stickPairs, triggers } = groupAxisControls(controls);
  if (stickPairs.length === 0 && triggers.length === 0) return null;

  return (
    <Box className="input-cal__cal-row">
      {stickPairs.map((pair, pairIdx) => (
        <StickAxisPanel key={pair.xControl.position} pair={pair} pairIdx={pairIdx} state={state} onCalibrate={onCalibrate} />
      ))}
      {triggers.map((trigger) => (
        <TriggerAxisPanel key={trigger.position} trigger={trigger} state={state} onCalibrate={onCalibrate} />
      ))}
    </Box>
  );
};

export { ControllerCalRow };
