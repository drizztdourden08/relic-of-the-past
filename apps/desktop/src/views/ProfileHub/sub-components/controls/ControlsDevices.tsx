/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Icon, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { RescanButton } from '../../../../compounds/RescanButton';
import { DeviceCard } from './DeviceCard';
import { ControllerGroupCard } from './ControllerGroupCard';
import type { DeviceAssignInfo } from './DeviceCard.type';
import type { CtrlProps } from './controls.type';

const ControlsDevices = ({ ctrl }: CtrlProps) => {
  const keyboardDevices = ctrl.filteredDevices.filter((d) => d.type === 'keyboard');
  const { setDevicesCollapsed, devicesCollapsed, setConfirmPreset } = ctrl;
  const toggleCollapsed = useCallback(() => setDevicesCollapsed(!devicesCollapsed), [setDevicesCollapsed, devicesCollapsed]);
  const handleAssign = useCallback((d: DeviceAssignInfo) => {
    if (!d.sdlType) return;
    setConfirmPreset({ sdlType: d.sdlType, deviceName: d.displayName, vid: d.vendorId ?? '', pid: d.productId ?? '' });
  }, [setConfirmPreset]);

  return (
    <Box className={`controls-settings__devices-column ${ctrl.devicesCollapsed ? 'controls-settings__devices-column--collapsed' : ''}`}>
      <Box className="controls-settings__col-header">
        <IconButton variant="ghost" size="xs" onClick={toggleCollapsed} label={ctrl.devicesCollapsed ? 'Expand' : 'Collapse'}>
          <Icon name={ctrl.devicesCollapsed ? 'chevron-left' : 'chevron-right'} />
        </IconButton>
        <Text className="controls-settings__col-title">Devices</Text>
        <RescanButton isPending={ctrl.isRescanPending} onRescan={ctrl.handleRescan} />
      </Box>
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
      </Box>
      <Text as="p" className="controls-settings__devices-column-expanded controls-settings__device-hint">
        Click controller icon or drag onto bindings to assign.
      </Text>
    </Box>
  );
};

export { ControlsDevices };
