/* @layer renderer-components @kind component */
/** The Run tab's one-line network status: the state, the ping and the players online; opens the Network tab. */
import { Button, Text } from '@ds/primitives';
import { StateChip } from './StateChip';
import { useNetworkStatus } from '../behavior/useNetworkStatus';
import { formatMs } from '../behavior/network-format';
import { healthChip, stateChip } from '../behavior/network-tone';
import type { NetworkStatus } from '@app/lib/game/randomizer-client';
import '../NetworkTab.css';

interface NetworkPillProps {
  onOpen: () => void;
}

const summaryOf = (status: NetworkStatus): string => {
  const online = status.players.filter((player) => player.online === true).length;
  return `ping ${formatMs(status.health.pingMs)}, ${online} / ${status.players.length} online`;
};

const NetworkPill = ({ onOpen }: NetworkPillProps) => {
  const { status, now } = useNetworkStatus();
  const chip = status === null
    ? { tone: 'idle' as const, label: 'not connected' }
    : status.connection.state === 'connected' ? healthChip(status, now) : stateChip(status.connection, now);

  return (
    <Button variant="ghost" size="sm" className="network-tab__pill" onClick={onOpen} title="Open the Network tab">
      <StateChip {...chip} />
      {status !== null && status.connection.state === 'connected' && (
        <Text className="network-tab__pill-text">{summaryOf(status)}</Text>
      )}
    </Button>
  );
};

export { NetworkPill };
export type { NetworkPillProps };
