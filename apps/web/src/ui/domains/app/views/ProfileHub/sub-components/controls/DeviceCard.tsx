/* @layer renderer-components @kind data */
/**
 * DeviceCard — shows a detected input device (gamepad or keyboard).
 * Two-column layout: left = controller icon (acts as status light + click to
 * assign), right = label + capabilities. An unavailable gamepad shows the
 * same explain+remedy notice as the Input Calibration page, and can't be
 * dragged or clicked to assign — SDL3 never opened it, so there's no preset
 * to bind against yet.
 */

import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Image } from '../../../../../../design-system/primitives/Image';
import { ControllerCapabilityBadges } from '../../../../compounds/ControllerCapabilityBadges';
import { UnavailableControllerNotice } from '../../../../compounds/UnavailableControllerNotice';
import { publicAsset } from '@app/lib/assets/public-asset';
import { setDeviceDragData } from './device-drag-data';
import type { DeviceCardProps } from './DeviceCard.type';
import './DeviceCard.css';

/** Map controller family → silhouette icon path */
const FAMILY_ICON: Record<string, string> = {
  xbox: publicAsset('buttons/xbox/controller_xboxseries.svg'),
  playstation: publicAsset('buttons/generic/generic_joystick.svg'),
  nintendo: publicAsset('buttons/switch/controller_switch_pro.svg'),
  '8bitdo': publicAsset('buttons/generic/generic_joystick.svg'),
  keyboard: publicAsset('buttons/keyboard/keyboard.svg'),
  generic: publicAsset('buttons/generic/generic_joystick.svg'),
};

/** Map specific SDL type → more accurate icon than the family default */
const SDL_TYPE_ICON: Record<string, string> = {
  gamecube: publicAsset('buttons/gc/controller_gamecube.svg'),
};

const DeviceCard = (props: DeviceCardProps) => {
  const { id, displayName, deviceFamily, sdlType, vendorId, productId, status, busType, hasRumble, hasGyro, onAssign, onAddMapping } = props;
  const isUnavailable = status === 'unavailable';

  const handleDragStart = (e: React.DragEvent) => {
    if (isUnavailable) { e.preventDefault(); return; }
    setDeviceDragData(e, { id, displayName, sdlType, vendorId, productId });
  };

  const handleAssign = () => {
    if (isUnavailable) return;
    onAssign?.({ sdlType, displayName, vendorId, productId });
  };

  const iconSrc = (sdlType && SDL_TYPE_ICON[sdlType]) ?? FAMILY_ICON[deviceFamily] ?? FAMILY_ICON.generic;
  const statusClass = isUnavailable ? 'device-card__icon-btn--disconnected' : 'device-card__icon-btn--active';
  const statusTitle = isUnavailable ? 'Unavailable' : 'Click to assign';

  return (
    <Box className={`device-card ${isUnavailable ? 'device-card--disconnected' : ''}`} draggable={!isUnavailable} onDragStart={handleDragStart} data-device-id={id}>
      <Box className="device-card__row">
        <Box className="device-card__left">
          <Button variant="bare" className={`device-card__icon-btn ${statusClass}`} onClick={handleAssign} title={statusTitle}>
            <Image src={iconSrc} alt={deviceFamily} className="device-card__icon" />
          </Button>
        </Box>
        <Box className="device-card__info">
          <Text className="device-card__name">{displayName}</Text>
          <Box className="device-card__badges">
            <ControllerCapabilityBadges busType={busType} hasRumble={hasRumble} hasGyro={hasGyro} />
          </Box>
        </Box>
      </Box>
      {isUnavailable && onAddMapping && <UnavailableControllerNotice onAddMapping={onAddMapping} />}
    </Box>
  );
};

export { DeviceCard };
