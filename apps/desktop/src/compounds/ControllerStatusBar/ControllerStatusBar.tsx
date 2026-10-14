/* @layer renderer-components @kind component */
import vibrateIcon from '@iconify-icons/lucide/vibrate';
import gyroIcon from '@iconify-icons/lucide/rotate-3d';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { connectionLookOf } from './behavior/connection-look';
import type { ControllerStatusBarProps } from './ControllerStatusBar.type';
import { StatusItem } from './sub-components/StatusItem';
import './ControllerStatusBar.css';

const ControllerStatusBar = (props: ControllerStatusBarProps) => {
  const { busType, connectionState, hasRumble, hasGyro, idLabel } = props;
  const connection = connectionLookOf(busType, connectionState);

  if (!connection && !hasRumble && !hasGyro && !idLabel) return null;

  return (
    <Box className="controller-status-bar">
      {connection && <StatusItem icon={connection.icon} label={connection.label} />}
      {hasRumble && <StatusItem icon={vibrateIcon} label="Rumble" />}
      {hasGyro && <StatusItem icon={gyroIcon} label="Gyro" />}
      {idLabel && (
        <Text className="controller-status-bar__id">{idLabel}</Text>
      )}
    </Box>
  );
};

export { ControllerStatusBar };
