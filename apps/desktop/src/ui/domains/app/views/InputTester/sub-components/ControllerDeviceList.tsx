/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { SDL_AXIS_NAMES, SDL_BUTTON_NAMES } from '@drizztdourden08/brock-input';
import type { ControllerInputState } from '../../../../../../lib/input/controller-input-store';
import { resolveDeviceFromEntry } from '@rotp/input-mapping';
import { ControllerCard } from './ControllerCard';
import type { ControllerDeviceListProps } from './ControllerDeviceList.type';

const idleStateFor = (deviceKey: string): ControllerInputState => ({
  deviceKey,
  buttons: new Array<boolean>(SDL_BUTTON_NAMES.length).fill(false),
  axes: new Array<number>(SDL_AXIS_NAMES.length).fill(0),
  timestamp: 0,
});

const ControllerDeviceList = (props: ControllerDeviceListProps) => {
  const { entries, controllerStates, onReportDevice } = props;

  const ready = useMemo(
    () => entries.filter((entry) => entry.status === 'ready').map((entry) => ({ entry, resolved: resolveDeviceFromEntry(entry) })),
    [entries],
  );

  return (
    <>
      {ready.map(({ entry, resolved }) => (
        <ControllerCard
          key={entry.deviceKey}
          deviceKey={entry.deviceKey}
          state={controllerStates.get(entry.deviceKey) ?? idleStateFor(entry.deviceKey)}
          resolvedDevice={resolved}
          busType={entry.busType}
          hasRumble={entry.hasRumble}
          hasGyro={entry.hasGyro}
          onReportDevice={onReportDevice}
        />
      ))}
    </>
  );
};

export { ControllerDeviceList };
