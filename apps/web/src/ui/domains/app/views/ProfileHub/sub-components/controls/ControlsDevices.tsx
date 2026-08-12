/* @layer renderer-components @kind component */
/** ControlsSettings right column: detected input devices (draggable / clickable to assign).
 *  Gamepads render from the SDL3 controller snapshot (ready/unavailable, adapter
 *  grouping); the keyboard entry still comes from InputManager's device list. */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import { RescanButton } from '../../../../compounds/RescanButton';
import { controllerCardInfo } from '../../../../../../../lib/input/controller-card-info';
import { DeviceCard } from './DeviceCard';
import { AdapterDeviceCard } from './AdapterDeviceCard';
import type { useControlsSettings } from '../useControlsSettings';

type Ctrl = ReturnType<typeof useControlsSettings>;

const ControlsDevices = ({ ctrl }: { ctrl: Ctrl }) => {
  const keyboardDevices = ctrl.filteredDevices.filter((d) => d.type === 'keyboard');

  return (
    <Box className={`controls-settings__devices-column ${ctrl.devicesCollapsed ? 'controls-settings__devices-column--collapsed' : ''}`}>
      <Box className="controls-settings__col-header">
        <Button
          variant="bare"
          className="controls-settings__col-toggle"
          onClick={() => ctrl.setDevicesCollapsed(!ctrl.devicesCollapsed)}
          title={ctrl.devicesCollapsed ? 'Expand' : 'Collapse'}
        >
          {ctrl.devicesCollapsed ? '◀' : '▶'}
        </Button>
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
            onAssign={(d) => {
              if (!d.sdlType) return;
              ctrl.setConfirmPreset({ sdlType: d.sdlType, deviceName: d.displayName, vid: '', pid: '' });
            }}
          />
        ))}

        {ctrl.controllerGroups.map((group) => {
          if (group.isAdapter) {
            return (
              <AdapterDeviceCard
                key={`${group.vendorId}:${group.productId}`}
                group={group}
                onAssign={(d) => {
                  if (!d.sdlType) return;
                  ctrl.setConfirmPreset({ sdlType: d.sdlType, deviceName: d.displayName, vid: d.vendorId ?? '', pid: d.productId ?? '' });
                }}
                onAddMapping={ctrl.addMapping}
              />
            );
          }

          const entry = group.ports[0].entry;
          const info = controllerCardInfo(entry);
          return (
            <DeviceCard
              key={group.ports[0].deviceKey}
              id={group.ports[0].deviceKey}
              displayName={info.displayName}
              deviceFamily={info.deviceFamily}
              sdlType={info.sdlType}
              vendorId={info.vendorId}
              productId={info.productId}
              status={entry.status}
              busType={entry.busType}
              hasRumble={entry.hasRumble}
              hasGyro={entry.hasGyro}
              onAssign={(d) => {
                if (!d.sdlType) return;
                ctrl.setConfirmPreset({ sdlType: d.sdlType, deviceName: d.displayName, vid: d.vendorId ?? '', pid: d.productId ?? '' });
              }}
              onAddMapping={ctrl.addMapping}
            />
          );
        })}

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
