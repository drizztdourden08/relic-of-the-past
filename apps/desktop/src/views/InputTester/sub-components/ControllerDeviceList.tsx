/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { DeviceCard } from '@drizztdourden08/brock-input/renderer';
import type { DeviceCardAction } from '@drizztdourden08/brock-input/renderer';
import { Box } from '@drizztdourden08/tessera/primitives';
import { ControllerStatusBar } from '../../../compounds/ControllerStatusBar';
import { RUMBLE_TESTS } from './ControllerCard.constants';
import { ControllerRawBytes } from './ControllerRawBytes';
import { RumbleStrengthControl } from './RumbleStrengthControl';
import { RumbleTestButton } from './RumbleTestButton';
import type { ControllerDeviceListProps } from './ControllerDeviceList.type';

const ControllerDeviceList = (props: ControllerDeviceListProps) => {
  const { entries, controllerStates, onReportDevice } = props;

  const ready = useMemo(
    () => entries.filter((entry) => entry.status === 'ready'),
    [entries],
  );
  const actions = useMemo<readonly DeviceCardAction[]>(() => [{
    id: 'report-controller',
    label: 'Report this controller as not working',
    icon: 'bug',
    variant: 'ghost',
    onSelect: (entry) => onReportDevice(entry.deviceKey),
  }], [onReportDevice]);

  return (
    <>
      {ready.map((entry) => (
        <Box key={entry.deviceKey} className="input-cal__device">
          <DeviceCard entry={entry.hasRumble ? { ...entry, hasRumble: false } : entry} actions={actions} />
          <Box className="input-cal__device-extra">
            {entry.hasRumble && (
              <Box className="input-cal__card-actions">
                <ControllerStatusBar hasRumble />
                {RUMBLE_TESTS.map((test) => <RumbleTestButton key={test.label} deviceKey={entry.deviceKey} test={test} />)}
                <RumbleStrengthControl deviceKey={entry.deviceKey} />
              </Box>
            )}
            <ControllerRawBytes state={controllerStates.get(entry.deviceKey) ?? { deviceKey: entry.deviceKey, buttons: [], axes: [], timestamp: 0 }} />
          </Box>
        </Box>
      ))}
    </>
  );
};

export { ControllerDeviceList };
