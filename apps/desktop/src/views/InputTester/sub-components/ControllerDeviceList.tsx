/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { resolveDeviceFromEntry } from '@rotp/input-mapping';
import type { ResolvedDevice } from '@rotp/input-mapping';
import type { ControllerInputState } from '../../../input/controller-input-store';
import { ControllerCard } from './ControllerCard';
import { UnavailableControllerCard } from './UnavailableControllerCard';
import { AdapterControllerCard } from './AdapterControllerCard';
import { IDLE_AXIS_SLOTS, IDLE_BUTTON_SLOTS } from './ControllerDeviceList.constants';
import type { ControllerDeviceListProps } from './ControllerDeviceList.type';

const idleStateFor = (deviceKey: string): ControllerInputState => ({
  deviceKey,
  buttons: new Array<boolean>(IDLE_BUTTON_SLOTS).fill(false),
  axes: new Array<number>(IDLE_AXIS_SLOTS).fill(0),
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
      const port = group.ports[0];
      if (group.isAdapter || !port || port.entry.status === 'unavailable') continue;
      map.set(port.deviceKey, resolveDeviceFromEntry(port.entry));
    }
    return map;
  }, [groups]);

  return (
    <>
      {groups.map((group) => {
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
        if (!port) return null;
        if (port.entry.status === 'unavailable') {
          return <UnavailableControllerCard key={port.deviceKey} entry={port.entry} onAddMapping={onAddMapping} />;
        }
        const resolvedDevice = resolvedByKey.get(port.deviceKey);
        if (!resolvedDevice) return null;
        return (
          <ControllerCard
            key={port.deviceKey}
            deviceKey={port.deviceKey}
            state={controllerStates.get(port.deviceKey) ?? idleStateFor(port.deviceKey)}
            resolvedDevice={resolvedDevice}
            hasStickCal={Boolean(stickCalibrationStore[port.deviceKey])}
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
