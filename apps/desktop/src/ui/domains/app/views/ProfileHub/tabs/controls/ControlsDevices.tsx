/* @layer renderer-components @kind component */
/** ControlsSettings right column: detected input devices (draggable / clickable to assign). */
import { DeviceCard } from './DeviceCard';
import type { useControlsSettings } from '../useControlsSettings';

type Ctrl = ReturnType<typeof useControlsSettings>;

const ControlsDevices = ({ ctrl }: { ctrl: Ctrl }) => {
  return (
    <div className={`controls-settings__devices-column ${ctrl.devicesCollapsed ? 'controls-settings__devices-column--collapsed' : ''}`}>
      <div className="controls-settings__col-header">
        <button
          className="controls-settings__col-toggle"
          onClick={() => ctrl.setDevicesCollapsed(!ctrl.devicesCollapsed)}
          title={ctrl.devicesCollapsed ? 'Expand' : 'Collapse'}
        >
          {ctrl.devicesCollapsed ? '◀' : '▶'}
        </button>
        <span className="controls-settings__col-title">Devices</span>
      </div>
      <div className="controls-settings__device-list">
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
          <p className="controls-settings__no-devices">No devices detected</p>
        )}
      </div>
      <p className="controls-settings__devices-column-expanded controls-settings__device-hint">
        Click controller icon or drag onto bindings to assign.
      </p>
    </div>
  );
};

export { ControlsDevices };
