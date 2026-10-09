/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import vibrateIcon from '@iconify-icons/lucide/vibrate';
import gyroIcon from '@iconify-icons/lucide/rotate-3d';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { BUS_ICON, BUS_LABEL, CONNECTION_ICON, CONNECTION_LABEL } from './ControllerStatusBar.constants';
import type { ControllerStatusBarProps } from './ControllerStatusBar.type';
import './ControllerStatusBar.css';

const ControllerStatusBar = (props: ControllerStatusBarProps) => {
  const { busType, connectionState, hasRumble, hasGyro, idLabel } = props;
  const connectionIcon = busType ? BUS_ICON[busType] : (connectionState ? CONNECTION_ICON[connectionState] : null);
  const connectionLabel = busType ? BUS_LABEL[busType] : (connectionState ? CONNECTION_LABEL[connectionState] : null);

  if (!connectionIcon && !hasRumble && !hasGyro && !idLabel) return null;

  return (
    <Box className="controller-status-bar">
      {connectionIcon && connectionLabel && (
        <Box className="controller-status-bar__item" title={connectionLabel}>
          <IconifyIcon icon={connectionIcon} width={14} height={14} />
          <Text>{connectionLabel}</Text>
        </Box>
      )}
      {hasRumble && (
        <Box className="controller-status-bar__item" title="Rumble">
          <IconifyIcon icon={vibrateIcon} width={14} height={14} />
          <Text>Rumble</Text>
        </Box>
      )}
      {hasGyro && (
        <Box className="controller-status-bar__item" title="Gyro">
          <IconifyIcon icon={gyroIcon} width={14} height={14} />
          <Text>Gyro</Text>
        </Box>
      )}
      {idLabel && (
        <Text className="controller-status-bar__id">{idLabel}</Text>
      )}
    </Box>
  );
};

export { ControllerStatusBar };
