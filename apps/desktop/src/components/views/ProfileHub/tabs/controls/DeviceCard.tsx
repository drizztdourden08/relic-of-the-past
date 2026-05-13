/**
 * DeviceCard — shows a detected input device (gamepad or keyboard).
 * Draggable: drop onto the binding editor to apply that device's preset.
 * Status light: green = activated (Web API ready), yellow = detected but not activated.
 */

import type { DetectedDevice } from '@shared/types/controls';
import './DeviceCard.css';

interface DeviceCardProps {
  device: DetectedDevice;
  onDragStart?: (device: DetectedDevice) => void;
}

/** Map controller family → silhouette icon path */
const FAMILY_ICON: Record<string, string> = {
  xbox: '/buttons/xbox/controller_xboxseries.svg',
  playstation: '/buttons/generic/generic_joystick.svg',
  nintendo: '/buttons/switch/controller_switch_pro.svg',
  '8bitdo': '/buttons/generic/generic_joystick.svg',
  keyboard: '/buttons/keyboard/keyboard.svg',
  generic: '/buttons/generic/generic_joystick.svg',
};

export function DeviceCard({ device, onDragStart }: DeviceCardProps): JSX.Element {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/x-device-id', device.id);
    e.dataTransfer.setData('application/x-preset-id', device.presetId ?? '');
    e.dataTransfer.setData('application/x-vid', device.vendorId ?? '');
    e.dataTransfer.setData('application/x-pid', device.productId ?? '');
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(device);
  };

  const iconSrc = FAMILY_ICON[device.controllerFamily] ?? FAMILY_ICON.generic;

  const statusClass = !device.connected
    ? 'device-card__status--disconnected'
    : device.activated
      ? 'device-card__status--active'
      : 'device-card__status--detected';

  const statusTitle = !device.connected
    ? 'Disconnected'
    : device.activated
      ? 'Ready'
      : 'Press a button to activate';

  const apiLabel = device.type === 'keyboard' ? null
    : device.inputApi === 'xinput' ? 'XInput'
    : device.inputApi === 'hid' ? 'HID'
    : 'WebAPI';

  return (
    <div
      className={`device-card ${device.connected ? '' : 'device-card--disconnected'}`}
      draggable
      onDragStart={handleDragStart}
    >
      <span className={`device-card__status ${statusClass}`} title={statusTitle} />
      <img src={iconSrc} alt={device.controllerFamily} className="device-card__icon" />
      <div className="device-card__info">
        <span className="device-card__name">{device.displayName}</span>
        {apiLabel && <span className={`device-card__api device-card__api--${device.inputApi}`}>{apiLabel}</span>}
      </div>
      <span className="device-card__drag-hint" title="Drag to assign to profile">⠿</span>
    </div>
  );
}
