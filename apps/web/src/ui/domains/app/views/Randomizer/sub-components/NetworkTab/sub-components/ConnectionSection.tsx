/* @layer renderer-components @kind component */
/**
 * Where the session is connected, as whom, and in what state. Below the rows, the editor
 * (children), which names the reason when it failed; with no editor, the reason alone.
 */
import { Text } from '@ds/primitives';
import { NetworkSection } from './NetworkSection';
import { formatCountdown, formatSince, formatValue, formatYesNo } from '../behavior/network-format';
import { stateChip } from '../behavior/network-tone';
import type { ReactNode } from 'react';
import type { NetworkConnection } from '@app/lib/game/randomizer-client';
import type { NetworkRow } from './NetworkSection';

interface ConnectionSectionProps {
  connection: NetworkConnection;
  now: number;
  children?: ReactNode;
}

const worldText = (connection: NetworkConnection): string => {
  const { worldVersion, appWorldVersion } = connection;
  if (worldVersion === null) return `app ${appWorldVersion}`;
  return worldVersion === appWorldVersion ? worldVersion : `${worldVersion}, app ${appWorldVersion}`;
};

const connectionRows = (connection: NetworkConnection, now: number): NetworkRow[] => {
  const rows: NetworkRow[] = [
    { label: 'server', value: connection.url ?? connection.configuredUrl },
    { label: 'room', value: formatValue(connection.seedName) },
    { label: 'server version', value: formatValue(connection.serverVersion) },
    { label: 'generator', value: formatValue(connection.generatorVersion) },
    { label: 'slot', value: connection.slot === null ? connection.slotName : `${connection.slot} ${connection.slotName}` },
    { label: 'team', value: formatValue(connection.team) },
    { label: 'client id', value: formatValue(connection.uuidShort) },
    { label: 'world package', value: worldText(connection) },
    { label: 'death link', value: connection.deathLink ? 'on' : 'off' },
    { label: 'password', value: formatYesNo(connection.passwordUsed) },
    { label: 'connected for', value: formatSince(connection.connectedAt, now) },
  ];
  if (connection.state === 'reconnecting') {
    const { reconnectAttempt, nextRetryAt, retryInFlight } = connection;
    rows.push(retryInFlight
      ? { label: 'try', value: `#${reconnectAttempt} now` }
      : { label: 'next try', value: `#${reconnectAttempt} in ${formatCountdown(nextRetryAt, now)}` });
  }
  return rows;
};

const ConnectionSection = ({ connection, now, children }: ConnectionSectionProps) => (
  <NetworkSection title="Connection" chip={stateChip(connection, now)} rows={connectionRows(connection, now)}>
    {children ?? (connection.error !== null && <Text className="randomizer-page__hint--error">{connection.error}</Text>)}
  </NetworkSection>
);

export { ConnectionSection };
export type { ConnectionSectionProps };
