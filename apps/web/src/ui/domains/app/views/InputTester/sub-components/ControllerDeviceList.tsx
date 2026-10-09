/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import type { ControllerInputState } from '../../../../../../lib/input/controller-input-store';
import { resolveDeviceFromEntry } from '../../../../../../lib/input/resolve-device';
import type { ResolvedDevice } from '@shared/input/family';
import { ControllerCard } from './ControllerCard';
import { UnavailableControllerCard } from './UnavailableControllerCard';
import { AdapterControllerCard } from './AdapterControllerCard';
import { IDLE_AXIS_SLOTS, IDLE_BUTTON_SLOTS } from './ControllerDeviceList.constants';
import type { ControllerDeviceListProps } from './ControllerDeviceList.type';

const idleStateFor = (deviceKey: string): ControllerInputState => ({
  deviceKey,
  buttons: new Array(IDLE_BUTTON_SLOTS).fill(false),
  axes: new Array(IDLE_AXIS_SLOTS).fill(0),
  timestamp: 0,
});

const ControllerDeviceList = (props: ControllerDeviceListProps) => {
  const {
    groups, controllerStates, stickCalibrationStore,
    onStickCalibrationComplete, onTriggerCalibrationComplete, onAddMapping, onReportDevice,
  } = props;

  const resolvedByKey = useMemo(() => {
    const map = new Map<string, ResolvedDevice>();
    for (const group of groups) {
      if (group.isAdapter) continue;
      const port = group.ports[0];
      if (port.entry.status === 'unavailable') continue;
      map.set(port.deviceKey, resolveDeviceFromEntry(port.entry));
    }
    return map;
  }, [groups]);

  return (
    <>
      {groups
        .map((group) => {
          if (group.isAdapter) {
            return (
              <AdapterControllerCard
                key={`${group.vendorId}:${group.productId}`}
                group={group}
                controllerStates={controllerStates}
                onAddMapping={onAddMapping}
              />
            );
          }

          const port = group.ports[0];
          if (port.entry.status === 'unavailable') {
            return <UnavailableControllerCard key={port.deviceKey} entry={port.entry} onAddMapping={onAddMapping} />;
          }

          const resolvedDevice = resolvedByKey.get(port.deviceKey);
          if (!resolvedDevice) return null;
          const state = controllerStates.get(port.deviceKey) ?? idleStateFor(port.deviceKey);

          return (
            <ControllerCard
              key={port.deviceKey}
              deviceKey={port.deviceKey}
              state={state}
              resolvedDevice={resolvedDevice}
              hasStickCal={!!stickCalibrationStore[port.deviceKey]}
              existingStickCal={stickCalibrationStore[port.deviceKey] ?? null}
              busType={port.entry.busType}
              hasRumble={port.entry.hasRumble}
              onReportDevice={onReportDevice}
              hasGyro={port.entry.hasGyro}
              onStickCalibrationComplete={onStickCalibrationComplete}
              onTriggerCalibrationComplete={onTriggerCalibrationComplete}
            />
          );
        })}
    </>
  );
};

export { ControllerDeviceList };
