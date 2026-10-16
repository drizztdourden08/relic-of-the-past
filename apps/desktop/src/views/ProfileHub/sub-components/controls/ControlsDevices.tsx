/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { SidePanel } from '@drizztdourden08/tessera/composites';
import { RescanButton } from '../../../../compounds/RescanButton';
import { DeviceCard } from './DeviceCard';
import { ControllerGroupCard } from './ControllerGroupCard';
import type { DeviceAssignInfo } from './DeviceCard.type';
import type { CtrlProps } from './controls.type';

const ControlsDevices = ({ ctrl }: CtrlProps) => {
  const keyboardDevices = ctrl.filteredDevices.filter((d) => d.type === 'keyboard');
  const { setConfirmPreset } = ctrl;
  const handleAssign = useCallback((d: DeviceAssignInfo) => {
    if (!d.sdlType) return;
    setConfirmPreset({ sdlType: d.sdlType, deviceName: d.displayName, vid: d.vendorId ?? '', pid: d.productId ?? '' });
  }, [setConfirmPreset]);

  const rescan = <RescanButton isPending={ctrl.isRescanPending} onRescan={ctrl.handleRescan} />;

  return (
    <SidePanel side="end" title="Devices" storageKey="controls.devices" actions={rescan}>
      <Box className="controls-settings__device-list">
        {keyboardDevices.map((device) => (
          <DeviceCard
            key={device.id}
            id={device.id}
            displayName={device.displayName}
            deviceFamily={device.deviceFamily}
            sdlType={device.sdlType}
            vendorId={null}
            productId={null}
            status="ready"
            onAssign={handleAssign}
          />
        ))}

        {ctrl.controllerGroups.map((group) => (
          <ControllerGroupCard
            key={`${group.vendorId}:${group.productId}`}
            group={group}
            onAssign={handleAssign}
            onAddMapping={ctrl.addMapping}
          />
        ))}

        {keyboardDevices.length === 0 && ctrl.controllerGroups.length === 0 && (
          <Text as="p" className="controls-settings__no-devices">No devices detected</Text>
        )}

        <Text as="p" className="controls-settings__device-hint">
          Click controller icon or drag onto bindings to assign.
        </Text>
      </Box>
    </SidePanel>
  );
};

export { ControlsDevices };
