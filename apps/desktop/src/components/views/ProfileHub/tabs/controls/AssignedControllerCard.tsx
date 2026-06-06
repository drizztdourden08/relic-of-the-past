/* @layer renderer-components @kind data */
/**
 * AssignedDeviceCard — shows the controller assigned to the active profile.
 * Displays connection/activation status, controller info, and an unassign button.
 */

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
    <div className={`assigned-controller ${!isConnected ? 'assigned-controller--disconnected' : ''}`}>
      <div className="assigned-controller__header">
        <span className="assigned-controller__label">Assigned Controller</span>
        <button className="assigned-controller__unassign" onClick={onUnassign} title="Unassign controller">
          ✕
        </button>
      </div>
      <div className="assigned-controller__body">
        <span className={`assigned-controller__status-dot ${statusClass}`} />
        <span className="assigned-controller__icon">{emoji}</span>
        <div className="assigned-controller__info">
          <span className="assigned-controller__name">{assigned.displayName}</span>
          <span className="assigned-controller__detail">
            {assigned.vendorId}:{assigned.productId} · {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export { AssignedDeviceCard };
