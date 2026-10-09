/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Button, Text, Image } from '@drizztdourden08/tessera/primitives';
import { ControllerCapabilityBadges } from '../../../../compounds/ControllerCapabilityBadges';
import { UnavailableControllerNotice } from '../../../../compounds/UnavailableControllerNotice';
import { setDeviceDragData } from './device-drag-data';
import { DEVICE_FAMILY_ICON, SDL_TYPE_ICON } from './controls.constants';
import type { DeviceCardProps } from './DeviceCard.type';
import './DeviceCard.css';

const DeviceCard = (props: DeviceCardProps) => {
  const { id, displayName, deviceFamily, sdlType, vendorId, productId, status, busType, hasRumble, hasGyro, onAssign, onAddMapping } = props;
  const isUnavailable = status === 'unavailable';

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (isUnavailable) { e.preventDefault(); return; }
    setDeviceDragData(e, { id, displayName, sdlType, vendorId, productId });
  }, [isUnavailable, id, displayName, sdlType, vendorId, productId]);

  const handleAssign = useCallback(() => {
    if (isUnavailable) return;
    onAssign?.({ sdlType, displayName, vendorId, productId });
  }, [isUnavailable, onAssign, sdlType, displayName, vendorId, productId]);

  const iconSrc = (sdlType && SDL_TYPE_ICON[sdlType]) ?? DEVICE_FAMILY_ICON[deviceFamily] ?? DEVICE_FAMILY_ICON.generic;
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
