/* @layer renderer-components @kind component */
/**
 * ControllerDeviceList — renders the SDL3 controller snapshot: a rich live
 * card for each ready single device, a compact explain+remedy card for each
 * unavailable device, and one grouped card per adapter. SDL3 is the only
 * controller transport now, so every group here is shown exactly once.
 */
import { useMemo } from 'react';
import type { ControllerInputState, DeviceStickCalibration } from '../../../../../../lib/input/controller-input-store';
import type { ControllerDeviceGroup } from '../../../../../../lib/input/controller-device-groups';
import { resolveDeviceFromEntry } from '../../../../../../lib/input/resolve-device';
import type { ResolvedDevice } from '@shared/input/family';
import type { TriggerCalibrationData } from './TriggerCalibrationWizard';
import { ControllerCard } from './ControllerCard';
import { UnavailableControllerCard } from './UnavailableControllerCard';
import { AdapterControllerCard } from './AdapterControllerCard';

interface ControllerDeviceListProps {
  groups: ControllerDeviceGroup[];
  controllerStates: Map<string, ControllerInputState>;
  stickCalibrationStore: Record<string, DeviceStickCalibration>;
  onStickCalibrationComplete: (cal: DeviceStickCalibration) => void;
  onTriggerCalibrationComplete: (deviceKey: string, axisIndex: number, cal: TriggerCalibrationData) => void;
  onAddMapping: (mapping: string) => Promise<boolean>;
  onReportDevice: (deviceKey: string) => void;
}

const ControllerDeviceList = (props: ControllerDeviceListProps) => {
  const {
    groups, controllerStates, stickCalibrationStore,
    onStickCalibrationComplete, onTriggerCalibrationComplete, onAddMapping, onReportDevice,
  } = props;

  // Resolved once per device, keyed off `groups`, which only changes on a
  // real snapshot update (see useControllerDevices), rather than recomputed
  // on every render this list gets from a `controllerStates` tick (up to 60/s
  // while the screen is open).
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
          const state = controllerStates.get(port.deviceKey) ?? {
            deviceKey: port.deviceKey,
            buttons: new Array(32).fill(false),
            axes: new Array(6).fill(0),
            timestamp: 0,
          };

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
              onTriggerCalibrationComplete={(axisIndex, cal) => onTriggerCalibrationComplete(port.deviceKey, axisIndex, cal)}
            />
          );
        })}
    </>
  );
};

export { ControllerDeviceList };
