/* @layer renderer-components @kind component */
/** ControlsSettings right column: detected input devices (draggable / clickable to assign). */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import { DeviceCard } from './DeviceCard';
import type { useControlsSettings } from '../useControlsSettings';

type Ctrl = ReturnType<typeof useControlsSettings>;

const ControlsDevices = ({ ctrl }: { ctrl: Ctrl }) => {
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
      </Box>
      <Box className="controls-settings__device-list">
        {ctrl.filteredDevices.map(device => (
          <DeviceCard
            key={device.id}
            device={device}
            onAssign={(d) => {
              if (!d.presetId) return;
              ctrl.setConfirmPreset({
                presetId: d.presetId,
                deviceName: d.displayName,
                vid: d.vendorId ?? '',
                pid: d.productId ?? '',
              });
            }}
          />
        ))}
        {ctrl.filteredDevices.length === 0 && (
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
