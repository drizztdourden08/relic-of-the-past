/* @layer renderer-components @kind component */
/**
 * UnavailableControllerCard — a device the lister sees but SDL3 hasn't
 * claimed. No live data exists for it (it was never opened), so this only
 * shows identification, status, and the two remedies.
 */
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Image } from '../../../../../design-system/primitives/Image';
import { ControllerStatusBadge } from '../../../compounds/ControllerStatusBadge';
import { ControllerStatusBar } from '../../../compounds/ControllerStatusBar';
import { UnavailableControllerNotice } from '../../../compounds/UnavailableControllerNotice';
import { controllerCardInfo } from '../../../../../../lib/input/controller-card-info';
import { CONTROLLER_ICON_MAP } from './input-cal-visuals';
import type { DeviceEntry } from '@shared/ipc';

interface UnavailableControllerCardProps {
  entry: DeviceEntry;
  onAddMapping: (mapping: string) => Promise<boolean>;
}

const UnavailableControllerCard = (props: UnavailableControllerCardProps) => {
  const { entry, onAddMapping } = props;
  const info = controllerCardInfo(entry);
  const icon = CONTROLLER_ICON_MAP[info.deviceFamily];

  return (
    <Box className="input-cal__card">
      <Box className="input-cal__card-header">
        {icon && <Image src={icon} alt="" draggable={false} width={28} height={28} />}
        <Text className="input-cal__card-name">{info.displayName}</Text>
        <ControllerStatusBadge status="unavailable" />
      </Box>
      <ControllerStatusBar
        busType={entry.busType}
        hasRumble={entry.hasRumble}
        hasGyro={entry.hasGyro}
        idLabel={`${info.vendorId}:${info.productId}`}
      />
      <UnavailableControllerNotice onAddMapping={onAddMapping} />
    </Box>
  );
};

export { UnavailableControllerCard };
