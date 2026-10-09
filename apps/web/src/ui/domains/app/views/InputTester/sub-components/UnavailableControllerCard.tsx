/* @layer renderer-components @kind component */
import { Box, Text, Image } from '@drizztdourden08/tessera/primitives';
import { ControllerStatusBadge } from '../../../compounds/ControllerStatusBadge';
import { ControllerStatusBar } from '../../../compounds/ControllerStatusBar';
import { UnavailableControllerNotice } from '../../../compounds/UnavailableControllerNotice';
import { controllerCardInfo } from '../../../../../../lib/input/controller-card-info';
import { CONTROLLER_ICON_MAP } from './input-cal-visuals';
import type { UnavailableControllerCardProps } from './ControllerDeviceList.type';

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
