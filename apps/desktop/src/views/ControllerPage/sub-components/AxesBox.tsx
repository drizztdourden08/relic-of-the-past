/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { Box, Card, Text } from '@drizztdourden08/tessera/primitives';
import { groupAxisControls } from '@app/input/resolved-axis-groups/group-axis-controls';
import { UNMAPPED_REASON } from '../ControllerPage.constants';
import type { BoxProps, CalibrationTarget } from '../ControllerPage.type';
import { CardCalibration } from './CardCalibration';
import { StickReadout } from './StickReadout';
import { TriggerReadout } from './TriggerReadout';

const AxesBox = ({ page }: BoxProps) => {
  const { resolved, state, deviceKey, calibration } = page;
  const [target, setTarget] = useState<CalibrationTarget>(null);
  const closeWizard = useCallback(() => setTarget(null), []);
  const { stickPairs, triggers } = groupAxisControls(resolved?.controls ?? []);
  const empty = stickPairs.length === 0 && triggers.length === 0;

  return (
    <Card title="Sticks and triggers" className="controller-page__axes">
      <Box className="controller-page__stack">
        {empty && (
          <Text className="controller-page__note">
            {resolved ? 'This controller has no sticks or triggers.' : UNMAPPED_REASON}
          </Text>
        )}
        <Box className="controller-page__readouts">
          {stickPairs.map((pair, pairIdx) => (
            <StickReadout key={pair.xControl.position} pair={pair} pairIdx={pairIdx} state={state} onCalibrate={setTarget} />
          ))}
          {triggers.map((trigger) => (
            <TriggerReadout key={trigger.position} trigger={trigger} state={state} onCalibrate={setTarget} />
          ))}
        </Box>
        <CardCalibration
          deviceKey={deviceKey}
          target={target}
          existingStickCal={calibration.existingStickCal}
          onClose={closeWizard}
          onStickComplete={calibration.onStickComplete}
          onTriggerComplete={calibration.onTriggerComplete}
        />
      </Box>
    </Card>
  );
};

export { AxesBox };
