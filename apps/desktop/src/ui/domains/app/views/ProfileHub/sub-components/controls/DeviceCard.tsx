/* @layer renderer-components @kind data */
/**
 * DeviceCard — shows a detected input device (gamepad or keyboard).
 * Two-column layout: left = controller icon (acts as status light + click to assign),
 * right = label + API badge.
 * Draggable: drop onto the binding editor to apply that device's preset.
 */

import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Image } from '../../../../../../design-system/primitives/Image';
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

const DeviceCard = (props: DeviceCardProps) => {
  const { device, onDragStart, onAssign } = props;
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
    <Box
      className={`device-card ${device.connected ? '' : 'device-card--disconnected'} ${device.stale ? 'device-card--stale' : ''}`}
      draggable
      onDragStart={handleDragStart}
      data-device-id={device.id}
    >
      <Box className="device-card__left">
        <Button
          variant="bare"
          className={`device-card__icon-btn ${statusClass}`}
          onClick={() => onAssign?.(device)}
          title={statusTitle}
        >
          <Image src={iconSrc} alt={device.deviceFamily} className="device-card__icon" />
        </Button>
        {apiLabel && <Text className={`device-card__api device-card__api--${device.inputApi}`}>{apiLabel}</Text>}
        {device.stale && <Text className="device-card__api device-card__api--stale">STALE</Text>}
      </Box>
      <Box className="device-card__info">
        <Text className="device-card__name">{device.displayName}</Text>
      </Box>
    </Box>
  );
}

export { DeviceCard };
