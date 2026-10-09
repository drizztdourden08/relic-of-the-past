/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Pressable, Text, Image } from '@drizztdourden08/tessera/primitives';
import { ControllerPortRow } from '../../../../compounds/ControllerPortRow';
import { UnavailableControllerNotice } from '../../../../compounds/UnavailableControllerNotice';
import { controllerCardInfo } from '../../../../../../../lib/input/controller-card-info';
import { setDeviceDragData } from './device-drag-data';
import { ADAPTER_FAMILY_ICON } from './controls.constants';
import type { AdapterDeviceCardProps } from './controls.type';

const AdapterDeviceCard = (props: AdapterDeviceCardProps) => {
  const { group, onAssign, onAddMapping } = props;
  const info = controllerCardInfo(group.ports[0].entry);
  const hasReadyPort = group.ports.some((port) => port.entry.status === 'ready');
  const hasUnavailablePort = group.ports.some((port) => port.entry.status === 'unavailable');
  const { sdlType, displayName, vendorId, productId } = info;

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (!hasReadyPort) { e.preventDefault(); return; }
    setDeviceDragData(e, { id: `adapter-${vendorId}-${productId}`, displayName, sdlType, vendorId, productId });
  }, [hasReadyPort, displayName, sdlType, vendorId, productId]);

  const handleAssign = useCallback(() => {
    if (!hasReadyPort) return;
    onAssign?.({ sdlType, displayName, vendorId, productId });
  }, [hasReadyPort, onAssign, sdlType, displayName, vendorId, productId]);

  const iconSrc = ADAPTER_FAMILY_ICON[info.deviceFamily] ?? ADAPTER_FAMILY_ICON.generic;

  return (
    <Box className={`device-card ${hasReadyPort ? '' : 'device-card--disconnected'}`} draggable={hasReadyPort} onDragStart={handleDragStart}>
      <Box className="device-card__row">
        <Box className="device-card__left">
          <Pressable className={`device-card__icon-btn ${hasReadyPort ? 'device-card__icon-btn--active' : 'device-card__icon-btn--disconnected'}`} onClick={handleAssign} title="Adapter">
            <Image src={iconSrc} alt={info.deviceFamily} className="device-card__icon" />
          </Pressable>
        </Box>
        <Box className="device-card__info">
          <Text className="device-card__name">{info.displayName}</Text>
        </Box>
      </Box>
      <Box>
        {group.ports.map((port) => (
          <ControllerPortRow
            key={`${group.vendorId}:${group.productId}:${port.portNumber}`}
            portNumber={port.portNumber}
            status={port.entry.status}
            busType={port.entry.busType}
            hasRumble={port.entry.hasRumble}
            hasGyro={port.entry.hasGyro}
          />
        ))}
      </Box>
      {hasUnavailablePort && onAddMapping && <UnavailableControllerNotice onAddMapping={onAddMapping} />}
    </Box>
  );
};

export { AdapterDeviceCard };
