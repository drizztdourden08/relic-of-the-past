/* @layer renderer-components @kind data */
/**
 * AssignedDeviceCard — shows the controller assigned to the active profile.
 * Displays connection/activation status, controller info, and an unassign button.
 */

import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import type { AssignedDevice, DetectedDevice } from '@shared/types/controls';
import './AssignedControllerCard.css';

interface AssignedDeviceCardProps {
  assigned: AssignedDevice;
  /** Live device matching the assigned controller, if connected */
  liveDevice: DetectedDevice | null;
  onUnassign: () => void;
}

const FAMILY_EMOJI: Record<string, string> = {
  xbox: '🎮',
  playstation: '🎮',
  nintendo: '🎮',
  '8bitdo': '🎮',
  keyboard: '⌨️',
  generic: '🎮',
};

const AssignedDeviceCard = (props: AssignedDeviceCardProps) => {
  const { assigned, liveDevice, onUnassign } = props;
  const isConnected = liveDevice?.connected ?? false;
  const isActivated = liveDevice?.activated ?? false;
  const emoji = FAMILY_EMOJI[assigned.deviceFamily] ?? '🎮';

  const statusLabel = !isConnected
    ? 'Disconnected'
    : isActivated
      ? 'Connected'
      : 'Connected — press a button to activate';

  const statusClass = !isConnected
    ? 'assigned-controller__status--disconnected'
    : isActivated
      ? 'assigned-controller__status--connected'
      : 'assigned-controller__status--detected';

  return (
    <Box className={`assigned-controller ${!isConnected ? 'assigned-controller--disconnected' : ''}`}>
      <Box className="assigned-controller__header">
        <Text className="assigned-controller__label">Assigned Controller</Text>
        <Button variant="bare" className="assigned-controller__unassign" onClick={onUnassign} title="Unassign controller">
          ✕
        </Button>
      </Box>
      <Box className="assigned-controller__body">
        <Box className={`assigned-controller__status-dot ${statusClass}`} />
        <Text className="assigned-controller__icon">{emoji}</Text>
        <Box className="assigned-controller__info">
          <Text className="assigned-controller__name">{assigned.displayName}</Text>
          <Text className="assigned-controller__detail">
            {assigned.vendorId}:{assigned.productId} · {statusLabel}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

export { AssignedDeviceCard };
