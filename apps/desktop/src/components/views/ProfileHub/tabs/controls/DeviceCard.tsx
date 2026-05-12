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

const FAMILY_EMOJI: Record<string, string> = {
  xbox: '🎮',
  playstation: '🎮',
  nintendo: '🎮',
  '8bitdo': '🎮',
  keyboard: '⌨️',
  generic: '🎮',
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

  const emoji = FAMILY_EMOJI[device.controllerFamily] ?? '🎮';

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
      <span className="device-card__icon">{emoji}</span>
      <div className="device-card__info">
        <span className="device-card__name">{device.displayName}</span>
        {apiLabel && <span className={`device-card__api device-card__api--${device.inputApi}`}>{apiLabel}</span>}
      </div>
      <span className="device-card__drag-hint" title="Drag to assign to profile">⠿</span>
    </div>
  );
}
