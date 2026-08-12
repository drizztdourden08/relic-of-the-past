/* @layer renderer-components @kind data */
/**
 * AdapterDeviceCard — one card for a device that presents one entry per
 * port (e.g. a 4-port wired adapter), instead of several near-identical
 * DeviceCards. Assigning a preset applies to the adapter as a whole (every
 * port shares the same vendor:product id), so the drag/click affordance
 * lives on the card, not per port; the port rows below are informational.
 */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Image } from '../../../../../../design-system/primitives/Image';
import { ControllerPortRow } from '../../../../compounds/ControllerPortRow';
import { UnavailableControllerNotice } from '../../../../compounds/UnavailableControllerNotice';
import { controllerCardInfo } from '../../../../../../../lib/input/controller-card-info';
import type { ControllerDeviceGroup } from '../../../../../../../lib/input/controller-device-groups';
import { publicAsset } from '@app/lib/assets/public-asset';
import { setDeviceDragData } from './device-drag-data';
import type { DeviceAssignInfo } from './DeviceCard.type';
import './DeviceCard.css';

const FAMILY_ICON: Record<string, string> = {
  xbox: publicAsset('buttons/xbox/controller_xboxseries.svg'),
  playstation: publicAsset('buttons/generic/generic_joystick.svg'),
  nintendo: publicAsset('buttons/switch/controller_switch_pro.svg'),
  '8bitdo': publicAsset('buttons/generic/generic_joystick.svg'),
  generic: publicAsset('buttons/generic/generic_joystick.svg'),
};

interface AdapterDeviceCardProps {
  group: ControllerDeviceGroup;
  onAssign?: (device: DeviceAssignInfo) => void;
  onAddMapping?: (mapping: string) => Promise<boolean>;
}

const AdapterDeviceCard = (props: AdapterDeviceCardProps) => {
  const { group, onAssign, onAddMapping } = props;
  const info = controllerCardInfo(group.ports[0].entry);
  const hasReadyPort = group.ports.some((port) => port.entry.status === 'ready');
  const hasUnavailablePort = group.ports.some((port) => port.entry.status === 'unavailable');

  const handleDragStart = (e: React.DragEvent) => {
    if (!hasReadyPort) { e.preventDefault(); return; }
    setDeviceDragData(e, { id: `adapter-${info.vendorId}-${info.productId}`, displayName: info.displayName, sdlType: info.sdlType, vendorId: info.vendorId, productId: info.productId });
  };

  const handleAssign = () => {
    if (!hasReadyPort) return;
    onAssign?.({ sdlType: info.sdlType, displayName: info.displayName, vendorId: info.vendorId, productId: info.productId });
  };

  const iconSrc = FAMILY_ICON[info.deviceFamily] ?? FAMILY_ICON.generic;

  return (
    <Box className={`device-card ${hasReadyPort ? '' : 'device-card--disconnected'}`} draggable={hasReadyPort} onDragStart={handleDragStart}>
      <Box className="device-card__row">
        <Box className="device-card__left">
          <Button variant="bare" className={`device-card__icon-btn ${hasReadyPort ? 'device-card__icon-btn--active' : 'device-card__icon-btn--disconnected'}`} onClick={handleAssign} title="Adapter">
            <Image src={iconSrc} alt={info.deviceFamily} className="device-card__icon" />
          </Button>
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
