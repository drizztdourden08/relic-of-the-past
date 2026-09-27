/* @layer renderer-components @kind component */
/** Whether the room still answers: the last packet, the traffic, the ping and the item queue. */
import { NetworkSection } from './NetworkSection';
import { formatAge, formatMs, formatYesNo } from '../behavior/network-format';
import { healthChip } from '../behavior/network-tone';
import type { NetworkStatus } from '@app/lib/game/randomizer-client';
import type { NetworkRow } from './NetworkSection';

interface HealthSectionProps {
  status: NetworkStatus;
  now: number;
}

const healthRows = (status: NetworkStatus, now: number): NetworkRow[] => {
  const { health } = status;
  return [
    { label: 'last packet', value: formatAge(health.lastPacketAt, now) },
    { label: 'packets in / out', value: `${health.packetsIn} / ${health.packetsOut}` },
    { label: 'ping', value: formatMs(health.pingMs) },
    { label: 'ping mean', value: health.pingSamples > 0 ? `${formatMs(health.pingMeanMs)} (${health.pingSamples})` : formatMs(null) },
    { label: 'received index', value: health.receivedIndex },
    { label: 'held for scouts', value: health.heldItems },
    { label: 'queued in game', value: health.queuedItems },
    { label: 'file in play', value: formatYesNo(health.fileInPlay) },
  ];
};

const HealthSection = ({ status, now }: HealthSectionProps) => (
  <NetworkSection title="Health" chip={healthChip(status, now)} rows={healthRows(status, now)} />
);

export { HealthSection };
export type { HealthSectionProps };
