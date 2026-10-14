/* @layer renderer-components @kind component */
import { Box, Icon, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { assignedControllerStatus } from './assigned-controller-status';
import { FAMILY_ICON_NAME } from './controls.constants';
import type { AssignedDeviceCardProps } from './controls.type';
import './AssignedControllerCard.css';

const AssignedDeviceCard = (props: AssignedDeviceCardProps) => {
  const { assigned, liveDevice, onUnassign } = props;
  const isConnected = liveDevice?.connected ?? false;
  const isActivated = liveDevice?.activated ?? false;
  const iconName = FAMILY_ICON_NAME[assigned.deviceFamily] ?? 'gamepad-2';
  const status = assignedControllerStatus(isConnected, isActivated);

  return (
    <Box className={`assigned-controller ${!isConnected ? 'assigned-controller--disconnected' : ''}`}>
      <Box className="assigned-controller__header">
        <Text className="assigned-controller__label">Assigned Controller</Text>
        <IconButton variant="ghost" tone="danger" size="xs" onClick={onUnassign} label="Unassign controller">
          <Icon name="x" />
        </IconButton>
      </Box>
      <Box className="assigned-controller__body">
        <Box className={`assigned-controller__status-dot ${status.className}`} />
        <Box className="assigned-controller__icon">
          <Icon name={iconName} />
        </Box>
        <Box className="assigned-controller__info">
          <Text className="assigned-controller__name">{assigned.displayName}</Text>
          <Text className="assigned-controller__detail">
            {assigned.vendorId}:{assigned.productId} · {status.label}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export { AssignedDeviceCard };
