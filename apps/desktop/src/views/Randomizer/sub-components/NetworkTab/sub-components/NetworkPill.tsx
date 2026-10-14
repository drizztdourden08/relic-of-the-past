/* @layer renderer-components @kind component */
import { Button, Text } from '@drizztdourden08/tessera/primitives';
import { StateChip } from './StateChip';
import { useNetworkStatus } from '../behavior/useNetworkStatus';
import { formatMs } from '../behavior/format-ms';
import { pillChip } from '../behavior/pill-chip';
import type { NetworkStatus } from '@app/game/randomizer-client';
import type { NetworkPillProps } from './NetworkPill.type';

const summaryOf = (status: NetworkStatus): string => {
  const online = status.players.filter((player) => player.online === true).length;
  return `ping ${formatMs(status.health.pingMs)}, ${online} / ${status.players.length} online`;
};

const NetworkPill = ({ onOpen }: NetworkPillProps) => {
  const { status, now } = useNetworkStatus();
  const chip = pillChip(status, now);

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
