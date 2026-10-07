/* @layer renderer-components @kind component */
/** Where the session is connected, as whom, and in what state; the last session's, while none runs. */
import { NetworkSection } from './NetworkSection';
import { formatCountdown, formatSince, formatValue, formatYesNo } from '../behavior/network-format';
import { stateChip } from '../behavior/network-tone';
import { NOT_CONNECTED_HINT } from '../behavior/network-view';
import type { NetworkConnection } from '@app/lib/game/randomizer-client';
import type { NetworkRow } from './NetworkSection';
import type { NetworkView } from '../behavior/network-view';
import type { PanelPlacement } from '../../../Randomizer.constants';

interface ConnectionSectionProps {
  placement: PanelPlacement;
  view: NetworkView;
  now: number;
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

const ConnectionSection = ({ placement, view, now }: ConnectionSectionProps) => {
  const { status, live, offline } = view;
  return (
    <NetworkSection
      placement={placement}
      title="Connection"
      chip={live && status !== null ? stateChip(status.connection, now) : offline}
      rows={status === null ? null : connectionRows(status.connection, now)}
      empty={NOT_CONNECTED_HINT}
    />
  );
};

export { ConnectionSection };
export type { ConnectionSectionProps };
