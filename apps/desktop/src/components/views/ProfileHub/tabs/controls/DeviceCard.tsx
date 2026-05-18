/**
 * DeviceCard — shows a detected input device (gamepad or keyboard).
 * Two-column layout: left = controller icon (acts as status light + click to assign),
 * right = label + API badge.
 * Draggable: drop onto the binding editor to apply that device's preset.
 */

import type { DetectedDevice } from '@shared/types/controls';
import './DeviceCard.css';

interface DeviceCardProps {
  device: DetectedDevice;
  onDragStart?: (device: DetectedDevice) => void;
  onAssign?: (device: DetectedDevice) => void;
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

/** Map specific preset → more accurate icon */
const PRESET_ICON: Record<string, string> = {
  'gamecube-wireless': '/buttons/gc/controller_gamecube.svg',
};

export function DeviceCard({ device, onDragStart, onAssign }: DeviceCardProps): JSX.Element {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/x-device-id', device.id);
    e.dataTransfer.setData('application/x-preset-id', device.presetId ?? '');
    e.dataTransfer.setData('application/x-vid', device.vendorId ?? '');
    e.dataTransfer.setData('application/x-pid', device.productId ?? '');
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(device);
  };

  const iconSrc = (device.presetId && PRESET_ICON[device.presetId]) ?? FAMILY_ICON[device.deviceFamily] ?? FAMILY_ICON.generic;

  const statusClass = !device.connected
    ? 'device-card__icon-btn--disconnected'
    : device.activated
      ? 'device-card__icon-btn--active'
      : 'device-card__icon-btn--detected';

  const statusTitle = !device.connected
    ? 'Disconnected'
    : device.activated
      ? 'Click to assign'
      : device.inputApi === 'hid'
        ? 'Connecting via HID…'
        : 'Press a button to activate';

  const apiLabel = device.type === 'keyboard' ? null
    : device.inputApi === 'xinput' ? 'XInput'
    : device.inputApi === 'hid' ? 'HID'
    : 'WebAPI';

  return (
    <div
      className={`device-card ${device.connected ? '' : 'device-card--disconnected'} ${device.stale ? 'device-card--stale' : ''}`}
      draggable
      onDragStart={handleDragStart}
      data-device-id={device.id}
    >
      <div className="device-card__left">
        <button
          className={`device-card__icon-btn ${statusClass}`}
          onClick={() => onAssign?.(device)}
          title={statusTitle}
          type="button"
        >
          <img src={iconSrc} alt={device.deviceFamily} className="device-card__icon" />
        </button>
        {apiLabel && <span className={`device-card__api device-card__api--${device.inputApi}`}>{apiLabel}</span>}
        {device.stale && <span className="device-card__api device-card__api--stale">STALE</span>}
      </div>
      <div className="device-card__info">
        <span className="device-card__name">{device.displayName}</span>
      </div>
    </div>
  );
}
