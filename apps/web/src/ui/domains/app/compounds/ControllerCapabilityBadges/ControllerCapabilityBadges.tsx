/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import vibrateIcon from '@iconify-icons/lucide/vibrate';
import gyroIcon from '@iconify-icons/lucide/rotate-3d';
import { Badge } from '../../../../design-system/primitives/Badge';
import { BUS_ICON, BUS_LABEL } from '../ControllerStatusBar/ControllerStatusBar.constants';
import type { ControllerCapabilityBadgesProps } from './ControllerCapabilityBadges.type';

const ControllerCapabilityBadges = (props: ControllerCapabilityBadgesProps) => {
  const { busType, hasRumble, hasGyro } = props;
  const busIcon = busType ? BUS_ICON[busType] : null;
  const busLabel = busType ? BUS_LABEL[busType] : null;

  return (
    <>
      {busIcon && busLabel && (
        <Badge variant="neutral" title={busLabel}>
          <IconifyIcon icon={busIcon} width={12} height={12} />
        </Badge>
      )}
      {hasRumble && (
        <Badge variant="neutral" title="Rumble">
          <IconifyIcon icon={vibrateIcon} width={12} height={12} />
        </Badge>
      )}
      {hasGyro && (
        <Badge variant="neutral" title="Gyro">
          <IconifyIcon icon={gyroIcon} width={12} height={12} />
        </Badge>
      )}
    </>
  );
};

export { ControllerCapabilityBadges };
