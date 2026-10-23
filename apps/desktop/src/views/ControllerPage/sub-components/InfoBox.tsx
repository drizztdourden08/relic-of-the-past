/* @layer renderer-components @kind component */
import { FactsPanel } from '@drizztdourden08/tessera/composites';
import { Box, Card, Status } from '@drizztdourden08/tessera/primitives';
import { ControllerPortRow } from '@app/compounds/ControllerPortRow';
import { ControllerStatusBar } from '@app/compounds/ControllerStatusBar';
import type { BoxProps } from '../ControllerPage.type';
import { controllerFacts } from '../behavior/controller-facts';
import { RumbleTests } from './RumbleTests';

const InfoBox = ({ page }: BoxProps) => {
  const { entry, deviceKey, adapterPort, calibration } = page;
  const ready = entry.status === 'ready';
  const status = <Status tone={ready ? 'success' : 'warning'}>{ready ? 'Connected' : 'Unavailable'}</Status>;

  return (
    <Card title="Controller" actions={status} className="controller-page__info">
      <Box className="controller-page__stack">
        <ControllerStatusBar
          detected
          showAbsent
          busType={entry.busType}
          connectionState={entry.connectionState}
          hasRumble={entry.hasRumble}
          hasGyro={entry.hasGyro}
        />
        <Box className="controller-page__badges">
          <Status tone="primary">HID</Status>
          {calibration.existingStickCal && <Status tone="success">Sticks Calibrated</Status>}
        </Box>
        <FactsPanel groups={controllerFacts(page)} layout="rows" label="Controller facts" />
        {adapterPort !== null && (
          <ControllerPortRow
            portNumber={adapterPort}
            status={entry.status}
            busType={entry.busType}
            hasRumble={entry.hasRumble}
            hasGyro={entry.hasGyro}
          />
        )}
        <RumbleTests deviceKey={deviceKey} hasRumble={Boolean(entry.hasRumble)} />
      </Box>
    </Card>
  );
};

export { InfoBox };
